const moment = require('moment');
const getPoints = require('./getPoints');

function withdrawPoints(userObject, points_to_withdraw){
    let currentDate = moment();
        let startDate = userObject.startDate
        startDate = moment(startDate);
        let years = currentDate.diff(startDate, 'years');
        let months = currentDate.diff(startDate, 'months');

    let points = getPoints(userObject.seniority, months, years);
    let balance = points.total - userObject.points_used;

    if(userObject.requested_withdraw > 0){
        return 'You already have a pending withdraw';
    }

    if (points_to_withdraw > balance){
        return 'withdraw amount bigger than your current balance';
    } else if (points_to_withdraw <= balance) {
        return 'withdraw viable, wait for manager and finance sign off';
    }

}

module.exports = withdrawPoints;