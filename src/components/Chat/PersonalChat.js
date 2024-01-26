import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore } from "../../firebase";

function PersonalChat({
  loggedInUser,
  selectedRecipient,
  handleRecipentChange,
  callback,
}) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const usersRef = firestore.collection("users");
    try {
      const snapshot = await usersRef.get();
      if (snapshot.empty) {
        setUsers([]);
        callback({ users: [] });
        return;
      }

      let data = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      data = data.filter((item) => item.email !== loggedInUser.email);
      setUsers(data);
      callback({ users: data });
    } catch (error) {
      console.error(
        "Error getting documents from the collection:",
        error.message
      );
    }
  };

  return (
    <List>
      {users?.map((user) => (
        <ListItem
          button
          key={user.email}
          style={
            selectedRecipient.email === user.email
              ? { backgroundColor: "antiquewhite" }
              : {}
          }
          onClick={() => handleRecipentChange(user)}
        >
          <ListItemIcon>
            <div className="avatar">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
          </ListItemIcon>
          <ListItemText>
            {user.firstName} {user.lastName}
          </ListItemText>
          {user.status === "active" && (
            <ListItemText secondary="online" align="right"></ListItemText>
          )}
        </ListItem>
      ))}
    </List>
  );
}

export default PersonalChat;
