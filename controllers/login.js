module.exports = function(app, passport) {

    const fs   = require('fs');
    const jwt  = require('jsonwebtoken');

    const LocalStrategy = require('passport-local').Strategy;
    const passportJWT = require('passport-jwt');
    const JWTStrategy = passportJWT.Strategy;
    const JWTExtractor = passportJWT.ExtractJwt;

    const privateKEY  = fs.readFileSync('./config/keys/private.key', 'utf8');

    const db = require("../models");

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
      }, async (email, password, done) => {
        try {
          console.log("Checking for user by email and password");
          const member = await db.users.findOne({where: {Email: email, Password: password}, raw: true});
          if(member) {
            console.log("User and password correct");
            return done(null, member);
          } else {
            console.log("Incorrect user / password");
            return done('Incorrect Username / Password');
          }
        } catch (error) {
            console.error(error.stack);
            done(error);
        }
      }));

    const cookieExtractor = function(req) {
          let token = null;
          if (req && req.cookies)
          {
            token = req.cookies['session'];
          }
          return token;
    };

    passport.use(new JWTStrategy({
        jwtFromRequest: JWTExtractor.fromExtractors([cookieExtractor, JWTExtractor.fromAuthHeaderAsBearerToken()]),
        secretOrKey: privateKEY,
      },
      (jwtPayload, done) => {
        if (jwtPayload.expires < Date.now()) {
            return done('jwt expired');
        }
        return done(null, jwtPayload);
      }
    ));

    // POST /register
    // --------------
    //
    // Inputs: { name, email, cellphone, password }
    // Output: 201 => Registration successful.
    //         400 => Bad input. Params do not validate.
    //         401 => Wrong user or wrong password
    //         500 => Server error 
    //
    app.post('/register', async function(req, res) {
      try {
        console.log("Attempting to register");
        const { name, email, cellphone, password } = req.body;

        const userByEmail = await db.users.findOne({where: {Email: email}, raw: true});

        if(!userByEmail) {
          const user = await db.users.create({User_Name: name, Email: email, Password: password, Cell_Phone: cellphone});
          if(user) {
            res.status(201)
              .json({});
          } else {
            console.error("Unable to create user");
            res.status(500)
              .send({error: "Unable to create user"});
          }
        } else {
          res.status(400)
            .send({error: "A user already exists with that email address"});
        }
      } catch (e) {
        console.error("Unable to create user: " + JSON.stringify(e));
        res.status(500)
          .send({error: "Unable to create user"});
      }
    });


    // POST /login
    // -----------
    //
    // Inputs: { email, password }
    // Output: 200 => Log in successful. Creates a JWT token in a cookie named 'session'. This session information have userId.
    //         400 => Bad input. Params do not validate.
    //         401 => Wrong user or wrong password
    //         500 => Server error 
    //
    app.post('/login', async function(req, res) {
        passport.authenticate(
          'local',
          { failureRedirect: '/login.html', session: false },
          (error, user) => {
            if (error || !user) {
                res.status(401)
                 .json({ error: "Invalid Email or password" });
            }

            if(user) {
                const expiration = Date.now() + parseInt(20 * 60 * 1000); 
                const payload = {
                    userId: user.user_id, 
                    userName: user.User_Name,
                    expires: expiration
                };
          
                req.login(payload, {session: false}, (error) => {
                    console.log("Attempting to log in");
                  if (error) {
                    res.status(400)
                       .json({ error });
                  }
                  const token = jwt.sign(JSON.stringify(payload), privateKEY);
          
                  res.cookie('session', token, { httpOnly: false, secure: true });
                  res.status(200)
                     .json({token: token});
                });    
            }
          },
        )(req, res);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.clearCookie('session');
        res.redirect('/');
    });

};


