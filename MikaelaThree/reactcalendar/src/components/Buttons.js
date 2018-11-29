import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import IconButton from '@material-ui/core/IconButton';
// import AddIcon from '@material-ui/icons/Add';
// import DeleteIcon from '@material-ui/icons/Delete';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

function ButtonSizes(props) {
  const { classes } = props;
  return (
    <div>
      
      {/* <button id="authorize-button">Log In</button>
        <button id="signout-button">Log Out</button>
        <button id="home" href={"../../public/home.html"}>Home</button>
        <button id="list1" href={"../../"} >To Do List</button>
        <button id="list2">Shopping List</button>  */}
    
      <div>
        <Button variant="contained" id="authorize-button" size="small" color="primary" className={classes.button}>
          Log In
        </Button>
        <Button variant="contained" id="signout-button" size="small" color="primary" className={classes.button}>
          Log Out
        </Button>
        <Button variant="contained" id="home" href={"home.html"} size="small" color="primary" className={classes.button}>
          Home
        </Button>
        <Button variant="contained" id="list1" href={"../../"} size="small" color="primary" className={classes.button}>
          To Do List
        </Button>
        <Button variant="contained" id="list2" size="small" color="primary" className={classes.button}>
          Shopping List
        </Button>
      
        
      </div>
 
     
    </div>
  );
}

ButtonSizes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonSizes);
