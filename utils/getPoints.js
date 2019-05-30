function getPoints(seniority, months, years){
    const seniorityObject = {
        'A' : 5,
        'B' : 10,
        'C' : 15,
        'D' : 20,
        'E' : 25
    }

    let monthly_seniority_points = seniorityObject[seniority] * months;
    
    let tenure_points = 0;
    if (years <= 2){
        tenure_points = monthly_seniority_points * 1 // 100/100 = 1
    } else if (years <= 4){
        tenure_points = monthly_seniority_points * 1.25 // 125/100 = 1.25
    } else if (years > 4){
        tenure_points = monthly_seniority_points * 1.5
    }

    return {
        monthly_seniority_points,
        tenure_points,
        total : monthly_seniority_points + tenure_points
    };

}

module.exports = getPoints;