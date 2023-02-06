export function timeAgo(timestamp: number) {
    if (!timestamp) {
        return ' ';
    }

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - timestamp / 1000;

    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    if (daysAgo > 0) {
        return daysAgo + (daysAgo > 1 ? ' days ago' : ' day ago');
    }

    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    if (hoursAgo > 0) {
        return hoursAgo + (hoursAgo > 1 ? ' hours ago' : ' hour ago');
    }

    const mineAgo = Math.floor(timeDiff / (1000 * 60));
    if (mineAgo > 0) {
        return mineAgo + (mineAgo > 1 ? ' mins ago' : ' min ago');
    }

    return 'less than an minute ago';
}
