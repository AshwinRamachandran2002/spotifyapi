var bodyParser = require('body-parser');
var express = require('express'); 
var request = require('request');
var cors = require('cors');
const ejs = require("ejs");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var app = express();
app.use(express.static(__dirname + '/'));
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");

app.set('views', __dirname);
var client_id = '7a61edb9f8af408ca25d6843f1cca398'; 
var client_secret = 'e84fee3e55b34c46b9d3f66a39c7b818'; 
var redirect_uri = 'https://ashwinsspotify.herokuapp.com/callback'; // Your redirect uri

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';



app.use(express.static(__dirname + '/views'))
   .use(cors())
   .use(cookieParser());

app.get('/', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
           

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        request.get(options, function(error, response, bodyof) {
          //do{
            playlist_id='37i9dQZF1E4oJSdHZrVjxD'
            //console.log(i)
          var options = {
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            headers: { 'Authorization': 'Bearer ' + access_token },
            market:'IN',
            limit:50,
            json: true
          };
         
          request.get(options, function(error, response, body) {
            var j=Math.floor(Math.random() * 50); 
            console.log(j)
           
            res.render("views/index.ejs", {name:body.items[j].track.name,url:body.items[j].track.preview_url});
            
          });
        })
        
    }});

    ;
    
});

const port = process.env.PORT || 3000
app.listen(port);

