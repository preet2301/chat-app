import {
  Grid,
  Paper,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Fab,
  Button,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { SendRounded } from '@mui/icons-material';

const Chat = () => {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState({});
  const [messages, setMessages] = useState([]);
  const [recipientMessages, setRecipientMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  useEffect(() => {
    getUsers();
    const unsubscribe = firestore
      .collection('messages')
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
  }, [messages]);

  const getUsers = async () => {
    const usersRef = firestore.collection('users');
    try {
      const snapshot = await usersRef.get();
      if (snapshot.empty) {
        setUsers([]);
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
      setFilteredUsers(data);
    } catch (error) {
      console.error(
        'Error getting documents from the collection:',
        error.message
      );
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    await firestore.collection('messages').add({
      sender: loggedInUser?.uid,
      recipient: selectedRecipient?.uid,
      content: newMessage,
      timestamp: new Date().getTime(),
    });

    setNewMessage('');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      return navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
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

  const searchUser = (text = '') => {
    const filteredUsers = (users || []).filter((user) => {
      const name = `${user?.firstName} ${user?.lastName}`;
      return (name || '').toLowerCase().includes(text.toLowerCase());
    });
    setFilteredUsers(filteredUsers);
  };

  if (!loggedInUser.email) {
    return navigate('/login');
  }

  return (
    <div>
      <Grid container component={Paper} sx={{ width: '100%', height: '95vh' }}>
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
          <Grid item xs={12} style={{ padding: '10px' }}>
            <TextField
              id="outlined-basic-email"
              label="Search"
              variant="outlined"
              fullWidth
              onChange={(e) => searchUser(e.target.value)}
            />
          </Grid>
          <Divider />
          <List>
            {filteredUsers?.map((user) => (
              <ListItem
                button
                key={user.email}
                style={
                  selectedRecipient.email === user.email
                    ? { backgroundColor: 'antiquewhite' }
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
                {user.status === 'active' && (
                  <ListItemText secondary="online" align="right"></ListItemText>
                )}
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={9}>
          {selectedRecipient?.email ? (
            <>
              {' '}
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
                              ? 'right'
                              : 'left'
                          }
                          primary={message?.content}
                        ></ListItemText>
                      </Grid>
                      <Grid item xs={12}>
                        <ListItemText
                          align={
                            message.sender === loggedInUser.uid
                              ? 'right'
                              : 'left'
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
              <Grid container style={{ padding: '20px' }}>
                <Grid item xs={11}>
                  <TextField
                    id="outlined-basic-email"
                    label="Type Something"
                    fullWidth
                    value={newMessage}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </Grid>
                <Grid xs={1} align="right">
                  <Fab onClick={sendMessage} color="primary" aria-label="add">
                    <SendRounded />
                  </Fab>
                </Grid>
              </Grid>{' '}
            </>
          ) : (
            <div className="no-chat-box">
              No chat to display. Please select a person to chat.
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Chat;
