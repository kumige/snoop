# snoop
web project for school
<p>Snoop is a website where you can ask questions from other users. You can answer questions with text and images. You can also follow other users, which will modify the home page feed to show answers from the people you followed.</p>
<p> It has a nodejs backend with GraphQL API, mongodb with authenticated mutations & Angular front-end</p>
<a href="https://mikkojro.jelastic.metropolia.fi/home">Link to website</a> </br>
<a href="https://mikkojro.jelastic.metropolia.fi/graphql">Link to GraphQL API</a>
<p>(these might not work in the future)</p>

<img src="https://raw.githubusercontent.com/kumige/snoop/master/uploads/ss.png">

### Environment stuff: 
.env:
<pre><code>
DB_URL=[ your db url ]
UPLOADS_DIR=[ path to uploads folder ]
UPLOADS_URL=[ url to uploads folder ]
NODE_ENV=[ development || production ]
</code></pre>

Angular environment.ts:
<pre><code>
uploadUrl: "http://localhost:3000/uploads/",
gqlUrl: "http://localhost:3000/graphql"
</code></pre>

### Some example queries
Get questions with answers
<pre><code>
query{
  qWithA(limit: 10, start: 0){
    id
    Sender {
      id
      Email
      Username
      Displayname
      ProfileInfo {
        id
        UserID
        Bio
        ProfilePicture
        Following
        Followers
        Favourites
        AnsweredQuestionCount
      }
      BlockedUsers
    } 
    Receiver {
      id
      Email
      Username
      Displayname
      ProfileInfo {
        id
        UserID
        Bio
        ProfilePicture
        Following
        Followers
        Favourites
        AnsweredQuestionCount
      }
      BlockedUsers
    } 
    Text
    Favourites
    DateTime {
      date
      time
    } 
    Answer {
      id
      Text
      Image
      DateTime {
        date
        time
      }
    } 
  }
}
</code></pre>
Register user
<pre><code>
mutation {
  registerUser(
    Email: "example@example.com"
    Username: "exampleUser"
    Password: "password123"
    Displayname: "exampleUSER"
  ) {
    id
    Username
  }
}
</code></pre>

Add answer to a question (with image)
<pre><code>
mutation($file: upload) {
        addAnswer(
          QuestionID: "${qID}"
          Text: "${answer}"
          Image: $file
        ) {
          id
          Text
          Image
          DateTime {
            date
            time
          }
        }
      }
</code></pre>

