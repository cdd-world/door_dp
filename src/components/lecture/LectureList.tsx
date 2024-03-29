import { Box, createStyles, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { FetchButton } from 'components/common/FetchButton';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { useCourses } from 'hooks/door/useCourses';
import { useCourseLectures } from 'hooks/door/useLectures';
import { ICourse } from 'models/door';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LectureListItem } from './LectureListItem';

const useStyles = makeStyles(theme =>
	createStyles({
		outerBordered: {
			paddingTop: 0,
			paddingBottom: 0,
			borderTop: '1px solid #E0E0E0',

			'&:last-child': {
				borderBottom: '1px solid #E0E0E0',
			},
		},
		innerBordered: {
			'&:not(:first-child)': {
				borderTop: '1px solid #E0E0E0',
			},
		},
	}),
);

export type RouteLectureListProps = RouteComponentProps<{
	courseId: ICourse['id'];
}>;

export const RouteLectureList: React.FC<RouteLectureListProps> = props => {
	const {
		match: {
			params: { courseId },
		},
	} = props;
	const { courseById } = useCourses();
	const course = courseById(courseId);

	if (course === undefined) return <Box>404 NOT FOUND</Box>;

	return <LectureList course={course} />;
};

export type LectureListProps = {
	course: ICourse;
};

export const LectureList: React.FC<LectureListProps> = props => {
	const { course } = props;
	const classes = useStyles();
	const { lecturesState, lecturesByWeek, weeks, fetchLectures, fetchLectureProgresses } = useCourseLectures(course.id);

	const triggerFetch = async () => {
		await fetchLectures();
		await fetchLectureProgresses();
	};

	// fetch lecture progresses for update state (every 60 seconds)
	useEffect(() => {
		const timer = setInterval(triggerFetch, 1000 * 60);

		return () => clearInterval(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box>
			<KeepLatestState state={lecturesState} onTriggerFetch={triggerFetch} />

			<FetchButton state={lecturesState} onFetch={triggerFetch} />

			<Box height="0.7rem" />

			<List disablePadding>
				{weeks().map(week => (
					<ListItem className={classes.outerBordered} key={week}>
						<Box width="4rem" alignSelf="flex-start" marginTop={1}>
							<Typography variant="h5" display="inline">
								{week}
							</Typography>
							<Typography variant="subtitle1" display="inline">
								주차
							</Typography>
						</Box>
						<Box flex={1}>
							<List disablePadding>
								{lecturesByWeek(week).map(lecture => (
									<ListItem className={classes.innerBordered} key={lecture.period}>
										<LectureListItem lecture={lecture} />
									</ListItem>
								))}
							</List>
						</Box>
					</ListItem>
				))}
			</List>
		</Box>
	);
};
