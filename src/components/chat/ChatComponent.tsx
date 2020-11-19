import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/modules';
import { UserState } from 'store/modules/user';
import SockJsClient from 'react-stomp';
import { Course } from 'service/door/interfaces/course';
import { Message } from 'service/chat/interfaces/message';
import { AppBar, Box, createStyles, Grid, InputBase, List, ListItem, makeStyles, Paper, Toolbar, Typography } from '@material-ui/core';
import { Profile } from 'service/door/interfaces/user';
import { Alert } from '@material-ui/lab';
import { DateTime } from './core/DateTime';
import { getChatHistory } from 'service/chat/history';

const useStyles = makeStyles(theme => createStyles({
	main: {
		height: '100%'
	},
	chatBox: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column'
	},
	chatInput: {
		bottom: 0
	},
	chatMessages: {
		flex: '1 1 auto'
	},
	chatMessagePaper: {
		padding: theme.spacing(2)
	}
}));

export type ChatComponentProps = { course: Course }

const ChatMessage: React.FC<{ isMe: boolean, message: Message }> = props => {
	const { isMe, message } = props;
	const classes = useStyles();

	const justify = isMe ? 'flex-end' : 'flex-start';

	return (
		<>
			<ListItem>
				<Grid container justify={justify}>
					<Box display="flex" flexDirection="column" alignItems={justify}>
						<Typography variant="subtitle2">{message.user}</Typography>
						<Typography variant="body2" color="textSecondary">
							<DateTime date={message.timestamp} />
						</Typography>
					</Box>
				</Grid>
			</ListItem>
			<ListItem>
				<Grid container justify={justify}>
					<Grid item>
						<Paper className={classes.chatMessagePaper}>
							{message.message}
						</Paper>
					</Grid>
				</Grid>
			</ListItem>
		</>
	);
}

type ChatBoxProps = {
	profile: Profile,
	topic: string,
	connected: boolean,
	messages: Message[],
	onSendMessage: (message: Message) => void
}

const ChatBox: React.FC<ChatBoxProps> = props => {
	const { messages, onSendMessage, profile, topic, connected } = props;
	const classes = useStyles();
	const [message, setMessage] = useState('');

	return (
		<div className={classes.chatBox}>
			{!connected && <Alert severity="error">서버와 연결이 끊어졌습니다</Alert>}

			<List disablePadding className={classes.chatMessages}>
				{messages.map(message => (
					<ChatMessage key={message.timestamp} isMe={message.userId === profile.id} message={message} />
				))}
			</List>

			<AppBar color="default" position="sticky" className={classes.chatInput}>
				<Toolbar>
					<InputBase
						fullWidth
						placeholder="Send message ..."
						value={message}
						onChange={event => setMessage(event.target.value)}
						onKeyPress={event => {
							if(event.key === 'Enter') {
								onSendMessage({
									id: '',
									user: profile.name,
									userId: profile.id,
									message: message,
									timestamp: Date.now(),
									topic: topic
								});
								setMessage('');
							}
						}}
					/>
				</Toolbar>
			</AppBar>
		</div>
	);
}

export const ChatComponent: React.FC<ChatComponentProps> = props => {
	const { course } = props;
	const classes = useStyles();
	const dispatch = useDispatch();

	const user = useSelector<RootState, UserState>(state => state.user);

	const [messages, setMessages] = useState<Message[]>([]);
	const [connected, setConnected] = useState(false);
	const [clientRef, setClientRef] = useState<SockJsClient>(null);

	const webSocketSourceUrl = 'http://localhost:8000/chat/connect';
	const stompEndpoint = '/chat/message';
	const topic = `/topic/courses/${course.id}`;

	const receiveMessage = (message, topic: string) => {
		console.log('Chat: message receive', message);
		setMessages([ ...messages, message ]);
	};

	useEffect(() => {
		const fetch = async () => {
			setMessages((await getChatHistory(course.id)).messages);
		}

		fetch();
	}, []);

	return (
		<div className={classes.main}>
			{user.profile && <ChatBox
				profile={user.profile}
				topic={topic}
				connected={connected}
				onSendMessage={message => clientRef.sendMessage(stompEndpoint, JSON.stringify(message))}
				messages={messages}
			/>}

			<SockJsClient
				url={webSocketSourceUrl}
				topics={[topic]}
				ref={(client) => setClientRef(client)}
				onMessage={receiveMessage}
				onConnect={() => setConnected(true)}
				onDisconnect={() => setConnected(false)}
				debug={true}
			/>
		</div>
	);
}