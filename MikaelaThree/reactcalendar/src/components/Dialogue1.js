// https://material-ui.com/getting-started/installation/
// npm install @material-ui/core installed successfully

import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class FormDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleClickOpen}>To Add New Event</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">New Event <span className="icon">date_range</span></DialogTitle>
          <DialogContent>
            <DialogContentText>
              Add Your New Event Here to Keep Your Family and Friends Connected with All of Your Plans! 
            </DialogContentText>

            <TextField
              autoFocus
              margin="dense"
              id="eventname"
              label="Event Title"
              type="text"
              fullWidth
            />

            <TextField
              autoFocus
              margin="dense"
              id="location"
              label="Location"
              type="address"
              fullWidth
            />

             <TextField
              autoFocus
              margin="dense"
              id="starttime"
              label="Start Time"
              type="time"
              fullWidth
            />

             <TextField
              autoFocus
              margin="dense"
              id="endtime"
              label="End Time"
              type="time"
              fullWidth
            />

            <TextField
              autoFocus
              margin="dense"
              id="notes"
              label="Notes"
              type="text"
              fullWidth
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        
      </div>
    );
  }
}
