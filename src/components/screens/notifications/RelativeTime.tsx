import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import updateLocale from 'dayjs/plugin/updateLocale';
import React from 'react';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(utc);

interface RealtiveTimeProps{
    updatedAt:any
}

const RealtiveTime:React.FC<RealtiveTimeProps> = ({updatedAt}) => {
  const getFormattedTime = (timestamp: any) => {
    const now = dayjs();
    const timeStamp = dayjs(timestamp);
    const diffInSeconds = now.diff(timeStamp, 'second');
    const diffInMinutes = now.diff(timeStamp, 'minute');
    const diffInHours = now.diff(timeStamp, 'hour');
    const diffInDays = now.diff(timeStamp, 'day');
    const diffInMonths = now.diff(timeStamp, 'month');
    const diffInYears = now.diff(timeStamp, 'year');

    if (diffInSeconds < 30) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    } else {
      return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    }
  };

  return <React.Fragment>{getFormattedTime(updatedAt)}</React.Fragment>;
};

export default RealtiveTime;
