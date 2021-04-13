/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
 var bodyParser = require('body-parser');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
const ejs = require("ejs");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var app = express();
app.use(express.static(__dirname + '/'));
//app.use(bodyParser.urlencoded({extend:true}));
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");

app.set('views', __dirname);
var client_id = '7a61edb9f8af408ca25d6843f1cca398'; // Your client id
var client_secret = 'e84fee3e55b34c46b9d3f66a39c7b818'; // Your secret
var redirect_uri = 'http://localhost:3000/calback'//'https://ashwinsspotify.herokuapp.com/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
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



app.get('/',function(req,res){
  res.render("views/index.ejs", {name:'a',url:'a'});
})

app.get('/hi', function(req, res) {

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
//var i=0

var info={
  name:'hi',url:'l'
}

app.get('/callback', function(req, res) {
  //console.log('kk')
  var musicurl;
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  /*if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {*/
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
      //console.log(body)
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
           // console.log(access_token)

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, bodyof) {
          //do{
            playlist_id='37i9dQZF1E4oJSdHZrVjxD'
            //console.log(i)
          var options = {
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            headers: { 'Authorization': 'Bearer ' + access_token },
            market:'IN',
            linit:100,
            json: true
          };
          //console.log('kk',bodyof)
          request.get(options, function(error, response, body) {
            
            //console.log('mm',body.items[0].track)
            var urls = new Array(100);
            var names=new Array(100)
            for (var i = 0; i < 100; i++) {
              if(body.items[i]!=undefined)
                {urls[i] = body.items[i].track.preview_url
                  names[i]=body.items[i].track.name
                }
                
            }
            var j=Math.floor(Math.random() * 100); ;
            res.render("views/index.ejs", {name:names[j],url:urls[j]});
            info.name=names[7];info.url=urls[7]
            //res.redirect(urls[7])
            //console.log(names[7])
            
          });//i++;//}while(musicurl=='null');console.log(musicurl)*/
          
        })
        
    }});

    ;
    
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

//console.log('Listening on 8888');
app.listen(5000);


//module.exports={info}