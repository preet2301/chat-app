import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete } from "@mui/material";
import { firestore } from "../firebase";

export default function AddGroup({
  openAddGroup,
  handleAddGroupOpenClose,
  users = [],
}) {
  const [name, setName] = React.useState("");
  const [selectedMemebers, setSelectedMemebers] = React.useState([]);
  const [error, setError] = React.useState('');
  const groupAdmin = JSON.parse(localStorage.getItem('user') || '{}');
  groupAdmin.isAdmin = true;

  const createGroup = async () => {
    try {
      await firestore
        .collection('groups')
        .doc()
        .set({
          name: name,
          members: [groupAdmin, ...selectedMemebers],
          timestamp: new Date(),
        });
        handleAddGroupOpenClose(false);
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <React.Fragment>
      <Dialog
        fullWidth
        open={openAddGroup}
        onClose={() => handleAddGroupOpenClose(false)}
      >
        <DialogTitle>Create Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="standard"
          />
          <Autocomplete
            multiple
            id="tags-standard"
            options={users || []}
            value={selectedMemebers}
            onChange={(event, newValue) => {
              setSelectedMemebers(newValue);
            }}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`
            }
            defaultValue={[]}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label="Members"
                required
                placeholder="Search member"
              />
            )}
          />
          {error?.message && <p className="has-error">{error.message}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAddGroupOpenClose(false)}>Cancel</Button>
          <Button onClick={createGroup}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
