if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Placement = require('./models/placements');
const bodyParser = require('body-parser');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsyncError');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const session = require('express-session');
const placements = require('./routes/placement');
const cookieSession = require('cookie-session');
const userRoutes = require('./routes/users');
const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/placements';
// 'mongodb://localhost:27017/placements'
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
});

const secret = process.env.SECRET || 'thisisnotagoodsecret';
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

// middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));
var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('error ', e);
});
const sessionConfig = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/placements', placements);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/placement',
  catchAsync(async (req, res) => {
    const placements = await Placement.find({});
    res.render('placements/index', { placements });
  })
);

app.post(
  '/placement',
  urlencodedParser,
  catchAsync(async (req, res) => {
    // res.send(req.body)
    const company = new Placement(req.body.placement);
    await company.save();
    res.redirect(`/placements/${company._id}`);
  })
);

// app.get('/fakeuser', async (req,res)=>{
//     const user = new User({email:'aryan@gmail.com', username:'aryan', appliedCompanies: ['Apple', 'Amazon']})
//     const newUser = await User.register(user,'chicken')
//     res.send(newUser)
// })

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, something went wrong!';
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
