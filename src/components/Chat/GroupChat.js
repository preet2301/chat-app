import { Add, PlusOne } from "@mui/icons-material";
import {
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import AddGroup from "../AddGroup";
import { firestore } from "../../firebase";

function GroupChat({ loggedInUser, users, selectedGroup, handleGroupChange }) {
  const [openAddGroup, setOpenAddGroup] = React.useState(false);
  const [groups, setGroups] = React.useState([]);

  React.useEffect(() => {
    getGroups();
  }, []);

  const getGroups = async () => {
    const groupsRef = firestore.collection("groups");
    try {
      const snapshot = await groupsRef.get();
      if (snapshot.empty) {
        setGroups([]);
        return;
      }

      let data = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        const isGroupMember = (docData?.members || []).some(
          (member) => member?.email === loggedInUser?.email
        );
        if (isGroupMember) {
          data.push({
            id: doc.id,
            ...docData,
          });
        }
      });
      setGroups(data);
    } catch (error) {
      console.error(
        "Error getting documents from the collection:",
        error.message
      );
    }
  };
  const handleAddGroupOpenClose = (flag) => {
    setOpenAddGroup(flag);
    getGroups();
  };

  return (
    <div>
      <AddGroup
        openAddGroup={openAddGroup}
        handleAddGroupOpenClose={handleAddGroupOpenClose}
        users={users}
      />
      <div style={{ padding: "15px" }}>
        <Button
          fullWidth
          color="primary"
          size="large"
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            handleAddGroupOpenClose(true);
          }}
        >
          Add Group
        </Button>
      </div>
      <Divider />
      {(groups || []).length ? (
        <List>
          {groups?.map((group) => (
            <ListItem
              button
              key={group.name}
              style={
                selectedGroup?.id === group?.id
                  ? { backgroundColor: "antiquewhite" }
                  : {}
              }
              onClick={() => {
                handleGroupChange(group);
              }}
            >
              <ListItemIcon>
                <div className="avatar">
                  {group.name[0]}
                  {group.name[1]}
                </div>
              </ListItemIcon>
              <ListItemText>{group.name}</ListItemText>
            </ListItem>
          ))}
        </List>
      ) : (
        <ListItem>No groups found</ListItem>
      )}
    </div>
  );
}

export default GroupChat;
