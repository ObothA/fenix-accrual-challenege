/* eslint-disable no-console */
const Koa = require('koa');
const KoaRouter = require('koa-router');
const json = require('koa-json');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const moment = require('moment');

const personelRepository = require('./model/personelData');
const getPoints = require('./utils/getPoints');
const withdrawPoints = require("./utils/withdrawPoints");

const app = new Koa();
const router = new KoaRouter();

/* json prettier middleware */
app.use(json());
// bodyparser middleware
app.use(bodyParser());

/* setup views */
render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'html',
    cache: false,
    debug: false
})

/** custom authentication middleware */


/* routes */
router.get('/', index);
router.get('/login', loginGetReq);
router.post('/login', loginPostReq);
router.get('/logout', logoutReq);
router.post('/withdrawPoints', withdraw_points);
router.get('/manager_signOff/:index', managerSignOff)
router.get('/finance_signOff/:index', financeSignOff)
router.get('/test', ctx => ctx.body = personelRepository);

async function index(ctx){
    if(!ctx.userIndex && ctx.userIndex != 0 ) {
        await ctx.render('login');
    } else if( ctx.userIndex === -1) {
        await ctx.render('login');
    }  else {
        let personelData = personelRepository[ctx.userIndex];
        if(personelData.role === 'employee'){
            /* use moment js, a time library */
            let currentDate = moment();
            let startDate = personelData.startDate
            startDate = moment(startDate);
            let years = currentDate.diff(startDate, 'years');
            let months = currentDate.diff(startDate, 'months');

            let points = getPoints(personelData.seniority, months, years);

            await ctx.render('employeesView',{
                personelData,
                years,
                points,
                months,
                points_used: personelData.points_used
            });
        } else if (personelData.role === 'manager'){
            await ctx.render('managerView',{
                personelRepository
            });
        }  else if (personelData.role === 'finance'){
            await ctx.render('financeView',{
                personelRepository
            });
        } 
    }
}

async function loginGetReq(ctx){
    await ctx.render('login');
}

async function loginPostReq(ctx){
     /* extract data from post message */
    const body = ctx.request.body;
    let { role, seniority, employeeID } = body;
    // console.log(body);
    employeeID = parseInt(employeeID);
    
    let userIndex = -1;
    for(let counter = 0; counter < personelRepository.length; counter++){
        if(personelRepository[counter]['role'] == role && personelRepository[counter]['seniority'] == seniority && personelRepository[counter]['employeeID'] == employeeID ){
            userIndex = counter;
        }
    }

    if(userIndex === -1){
        /* user not found */
        ctx.redirect('/login');
    } else {
        app.context.userIndex = userIndex;
        ctx.redirect('/');
    }
}

async function logoutReq(ctx){
    ctx.userIndex = false;
    ctx.redirect('/login');
}

async function withdraw_points(ctx){
    const body = ctx.request.body;
    let { points } = body;

    points = parseInt(points);

    if(isNaN(points)){
        ctx.body = "Please enter a valid number";
    } else {
        let userObject = personelRepository[ctx.userIndex];
        let feedback = withdrawPoints(userObject, points);
        if (feedback === 'withdraw viable, wait for manager and finance sign off'){
            personelRepository[ctx.userIndex].requested_withdraw = points;
            personelRepository[ctx.userIndex].manager_sign_off = true;
            personelRepository[ctx.userIndex].finance_sign_off = true;
            ctx.body = feedback;
        } else {
            ctx.body = feedback;
        }
    }
}

async function managerSignOff(ctx){
    let index = ctx.params.index;
    personelRepository[index].manager_sign_off = false;
    ctx.redirect('/');
}

async function financeSignOff(ctx){
    let index = ctx.params.index;
    personelRepository[index].finance_sign_off = false;
    personelRepository[index].points_used = personelRepository[index].points_used + personelRepository[index].requested_withdraw;
    personelRepository[index].requested_withdraw = 0;
    ctx.redirect('/');
}

/* Router Middleware */
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log('Server started.... '));





