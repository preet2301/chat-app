import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function GroupMembers({ members, open, setOpen }) {
  return (
    <React.Fragment>
      <Dialog fullWidth open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Group Members</DialogTitle>
        <DialogContent>
          <ul>
            {members.map((member) => (
              <li key={member.email}>
                {member.firstName} {member.lastName}
                {member.isAdmin && " - Admin"}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
