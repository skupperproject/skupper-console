export const setMinutesAgo = function (timestamp: number, min = 1) {
    return timestamp - min * 60000;
};
