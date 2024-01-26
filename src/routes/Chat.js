import {
  Grid,
  Paper,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Button,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Group, Person, SendRounded } from "@mui/icons-material";
import BasicTabs from "../components/Tabs";
import PersonalChat from "../components/Chat/PersonalChat";
import GroupChat from "../components/Chat/GroupChat";
import GroupMembers from "../components/Members";

const Chat = () => {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [openGroupMemberDialog, setOpenGroupMemberDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState({});
  const [selectedGroup, setSelectedGroup] = useState({});
  const [messages, setMessages] = useState([]);
  const [recipientMessages, setRecipientMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    const unsubscribe = firestore
      .collection("messages")
      .onSnapshot((snapshot) => {
        let newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(newMessages);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    handleRecipentChange(selectedRecipient);
    handleGroupChange(selectedGroup);
  }, [messages]);

  const sendMessage = async (from) => {
    if (newMessage.trim() === "") return;

    const payload = {
      sender: loggedInUser?.uid,
      content: newMessage,
      timestamp: new Date().getTime(),
    };

    if (from === "group") {
      payload.group = selectedGroup?.id;
    } else {
      payload.recipient = selectedRecipient?.uid;
    }

    console.log("payload");
    console.log(payload);
    await firestore.collection("messages").add(payload);
    setNewMessage("");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      return navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleRecipentChange = (recipient) => {
    if (!loggedInUser?.uid || !recipient?.uid) {
      return;
    }
    let filteredMessages = (messages || []).filter(
      (item) =>
        (item.sender === recipient.uid &&
          item.recipient === loggedInUser.uid) ||
        (item.recipient === recipient.uid && item.sender === loggedInUser.uid)
    );
    filteredMessages = filteredMessages.sort(
      (a, b) => +a.timestamp - +b.timestamp
    );
    setRecipientMessages([...filteredMessages]);
    setSelectedRecipient(recipient);
  };

  const handleGroupChange = (group) => {
    if (!group?.id) {
      return;
    }
    let filteredMessages = [];
    (messages || []).forEach((message) => {
      if (message.group === group.id) {
        filteredMessages.push({
          ...message,
          name: (group?.members || [])
            .filter((member) => member.uid === message.sender)
            .map((item) => `${item.firstName} ${item.lastName}`)[0],
        });
      }
    });
    filteredMessages = filteredMessages.sort(
      (a, b) => +a.timestamp - +b.timestamp
    );

    setGroupMessages([...filteredMessages]);
    setSelectedGroup(group);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePersonalChatCallback = (data) => {
    setUsers(data.users || []);
  };

  if (!loggedInUser.email) {
    return navigate("/login");
  }

  return (
    <div>
      <Grid container component={Paper} sx={{ width: "100%", height: "95vh" }}>
        <Grid item xs={3} className="borderRight500">
          <List>
            <ListItem
              button
              key={`${loggedInUser.firstName} ${loggedInUser.lastName}`}
            >
              <ListItemIcon>
                <img src="user.png" alt="user" width={50} height={50} />
              </ListItemIcon>
              <ListItemText>
                Welcome {loggedInUser.firstName}&nbsp;&nbsp;|
                <Button onClick={handleLogout}>Logout</Button>
              </ListItemText>
            </ListItem>
          </List>
          <Divider />

          <BasicTabs
            options={[<Person />, <Group />]}
            activeTab={activeTab}
            handleChange={handleTabChange}
          />
          <Divider />
          {activeTab === 0 ? (
            <PersonalChat
              loggedInUser={loggedInUser}
              selectedRecipient={selectedRecipient}
              handleRecipentChange={handleRecipentChange}
              callback={handlePersonalChatCallback}
            />
          ) : (
            <GroupChat
              loggedInUser={loggedInUser}
              users={users || []}
              selectedGroup={selectedGroup}
              handleGroupChange={handleGroupChange}
            />
          )}
        </Grid>
        {activeTab === 0 && (
          <Grid item xs={9}>
            {selectedRecipient?.email ? (
              <>
                {" "}
                <div className="active-chat-header">
                  {selectedRecipient.firstName} {selectedRecipient.lastName}
                </div>
                <List className="message-area">
                  {(recipientMessages || []).map((message) => (
                    <ListItem key={message.timestamp}>
                      <Grid container>
                        <Grid item xs={12}>
                          <ListItemText
                            align={
                              message.sender === loggedInUser.uid
                                ? "right"
                                : "left"
                            }
                            primary={message?.content}
                          ></ListItemText>
                        </Grid>
                        <Grid item xs={12}>
                          <ListItemText
                            align={
                              message.sender === loggedInUser.uid
                                ? "right"
                                : "left"
                            }
                            secondary={new Date(
                              +message?.timestamp
                            ).toLocaleString()}
                          ></ListItemText>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <Grid container style={{ padding: "20px" }}>
                  <Grid item xs={11}>
                    <TextField
                      id="outlined-basic-email"
                      label="Type Something"
                      fullWidth
                      value={newMessage}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage("personal");
                        }
                      }}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </Grid>
                  <Grid xs={1} align="right">
                    <Fab
                      onClick={() => sendMessage("personal")}
                      color="primary"
                      aria-label="add"
                    >
                      <SendRounded />
                    </Fab>
                  </Grid>
                </Grid>{" "}
              </>
            ) : (
              <div className="no-chat-box">
                No chat to display. Please select a person to chat.
              </div>
            )}
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid item xs={9}>
            {selectedGroup?.id ? (
              <>
                {" "}
                <div className="active-chat-header">
                  {selectedGroup.name} &nbsp;&nbsp;&nbsp;
                  <Button
                    variant="outlined"
                    onClick={() => setOpenGroupMemberDialog(true)}
                  >
                    Members
                  </Button>
                </div>
                {openGroupMemberDialog && (
                  <GroupMembers
                    members={selectedGroup?.members}
                    open={openGroupMemberDialog}
                    setOpen={setOpenGroupMemberDialog}
                  />
                )}
                <List className="message-area">
                  {(groupMessages || []).map((message) => (
                    <ListItem key={message.timestamp}>
                      <Grid container>
                        <Grid item xs={12}>
                          <ListItemText
                            align={
                              message.sender === loggedInUser.uid
                                ? "right"
                                : "left"
                            }
                          >
                            <div
                              className={
                                message.sender === loggedInUser.uid
                                  ? "sender-message-box"
                                  : "recipient-message-box"
                              }
                            >
                              <div>
                                <b>{message?.name}</b>
                              </div>
                              <div>{message?.content}</div>
                            </div>
                          </ListItemText>
                        </Grid>
                        <Grid item xs={12}>
                          <ListItemText
                            align={
                              message.sender === loggedInUser.uid
                                ? "right"
                                : "left"
                            }
                            secondary={new Date(
                              +message?.timestamp
                            ).toLocaleString()}
                          ></ListItemText>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <Grid container style={{ padding: "20px" }}>
                  <Grid item xs={11}>
                    <TextField
                      id="outlined-basic-email"
                      label="Type Something"
                      fullWidth
                      value={newMessage}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage("group");
                        }
                      }}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </Grid>
                  <Grid xs={1} align="right">
                    <Fab
                      onClick={() => sendMessage("group")}
                      color="primary"
                      aria-label="add"
                    >
                      <SendRounded />
                    </Fab>
                  </Grid>
                </Grid>{" "}
              </>
            ) : (
              <div className="no-chat-box">
                No chat to display. Please select a group to chat.
              </div>
            )}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Chat;
