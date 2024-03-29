import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Container,
	createStyles,
	FormControlLabel,
	makeStyles,
	styled,
	TextField,
	TextFieldProps,
	Typography,
} from '@material-ui/core';
import { default as IconOriginal } from 'resources/icon-original.svg';
import React, { useEffect, useState } from 'react';
import { useUser } from 'hooks/door/useUser';
import { Alert } from '@material-ui/lab';
import { useHistory } from 'react-router';

const useStyles = makeStyles(theme =>
	createStyles({
		breathIcon: {
			animation: `$breathAnimation 6s infinite`,
		},
		'@keyframes breathAnimation': {
			'0%': {
				filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
			},
			'50%': {
				filter: 'drop-shadow(0 0 50px rgba(255, 255, 255, 0.9))',
			},
			'100%': {
				filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
			},
		},
	}),
);

const LoginTextField = styled((props: TextFieldProps) => <TextField fullWidth variant="outlined" {...props} />)(props => ({
	'& label.Mui-focused': {
		color: props.theme.palette.primary.contrastText,
	},
	'& label': {
		color: props.theme.palette.primary.contrastText,
	},
	'& .MuiOutlinedInput-root:not(.Mui-disabled)': {
		color: props.theme.palette.primary.contrastText,
		'& fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
		'&:hover fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
		'&.Mui-focused fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
	},
	'&:not(:first-child)': {
		marginTop: props.theme.spacing(2),
	},
	'& input[type=password]': {
		fontFamily: 'Malgun gothic',
	},
}));

const LoginCheckbox = styled(Checkbox)(props => ({
	'&:not(.Mui-disabled)': {
		color: props.theme.palette.primary.contrastText,
	},
}));

const AlertFullwidth = styled(Alert)({
	alignSelf: 'stretch',
});

export const LoginPage: React.FC = () => {
	const classes = useStyles();
	const [capsLockPressed, setCapsLockPressed] = useState(false);
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const history = useHistory();
	const { user, login, setPersistAuthorization } = useUser();

	const detectCapsLockPressed = (event: React.KeyboardEvent) => {
		setCapsLockPressed(event.getModifierState('CapsLock'));
	};

	const tryLogin = async (event: React.FormEvent<HTMLElement>) => {
		event.preventDefault();

		try {
			await login({ id, password });

			// check using auto login, and save credential
			//if (autoLogin) await saveCredential({ id, password });
		} catch (e) {}
	};

	// detect authenticate
	useEffect(() => {
		// means successfully logined
		if (user.authenticated) history.replace('/');
	}, [user.authenticated]);

	return (
		<Box
			flex={1}
			display="flex"
			alignItems="center"
			justifyContent="center"
			color="primary.contrastText"
			style={{
				background: 'linear-gradient(#2F71E9, 40%, #1657d0)',
			}}
		>
			<Container maxWidth="xs">
				<Box component="form" display="flex" flexDirection="column" alignItems="center" onSubmit={tryLogin}>
					<img className={classes.breathIcon} width="128px" alt="icon-original" src={IconOriginal} />

					<Box height="1.8rem" />

					<Typography variant="h5">환영합니다!</Typography>

					<Box height="0.8rem" />

					<Typography variant="subtitle1">
						Door Desktop을 사용하려면 Door 홈페이지에서 사용하는 아이디와 비밀번호로 로그인해 주세요.
					</Typography>

					<LoginTextField id="door-id" label="Door ID" disabled={user.pending} onChange={e => setId(e.target.value)} />
					<LoginTextField
						id="door-password"
						label="Door Password"
						type="password"
						disabled={user.pending}
						onChange={e => setPassword(e.target.value)}
						onBlur={() => setCapsLockPressed(false)}
						onKeyDown={detectCapsLockPressed}
						error={capsLockPressed}
						helperText={capsLockPressed ? 'CapsLock이 켜져 있습니다' : ' '}
					/>

					<FormControlLabel
						control={
							<LoginCheckbox
								checked={user.persistAuthorization}
								onChange={e => setPersistAuthorization(e.target.checked)}
								disabled={user.pending}
							/>
						}
						label="로그인 상태 유지"
					/>

					<Box height="0.6rem">
						{user.persistAuthorization && (
							<Typography variant="caption" color="error">
								개인정보 보호를 위해, 개인 PC에서만 사용해 주세요.
							</Typography>
						)}
					</Box>

					<Box height="1rem" />

					{user.error && (
						<>
							<AlertFullwidth variant="filled" severity="error">
								{user.error}
							</AlertFullwidth>
							<Box height="1rem" />
						</>
					)}

					{user.pending ? (
						<CircularProgress color="secondary" />
					) : (
						<Button type="submit" variant="contained" color="primary" fullWidth>
							<Typography variant="subtitle1">로그인</Typography>
						</Button>
					)}
				</Box>
			</Container>
		</Box>
	);
};
