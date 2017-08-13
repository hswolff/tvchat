# TV Chat

Welcome to the source code for TV Chat! A chatroom application built using React, Redux, Apollo, and GraphQL!

My original intent was to make this a hobby project but my interest in the project waned. Also writing a chatroom app is pretty dang hard! While developing this application I decided to try using GraphQL for the first time and I definitely bit off more than I could chew. I don't think GraphQL is best for a chat application, however everything aside from using it for real time chat updates was an absolute blast to play with.

Right now the basic website works and it's modestly styled. You're welcome to use this repo as an example for how to make a GraphQL powered website, or to contribute to make any improvements!

## [Live Demo](http://tv.hswolff.com/)

## Local Setup

1. MongoDB >= 3.4 is required to be installed.
2. Run the following to install dependencies.

```shell
npm install
cd client && npm install
cd ..
cd server && npm install
```

3. Run the server.

```shell
cd server && npm start
```

4. Run the client.
```shell
cd client && npm start
```

# Todo

Features I'm looking to add.

### Homepage
  - DONE: Add introduction paragraph at the top of the page explaining what the website is.
    ex.) Welcome to HarryTV, the best place to have a real time chat about TV shows that you're watching! HarryTV connects you with tv fans from around the world from the comfort of your couch. While you enjoy watching your newest episode chat about it with other fans on HarryTV!

  - DONE: Tune the update algorithm, should update once every hour, on the hour.

  - DONE: Show count of how many people are in each chatroom on the home page so you know where conversations are

  - DONE: Additionally Group shows that have people chatting at top and rest at the bottom.


### Infra
  - DONE: If a user can not log in then just log them out and clear localStorage.
    if the refresh token goes bad or the localStorage gets corrupted.

  - Self host images
    https://github.com/lovell/sharp

  - Favicon.

  - DONE: Make updating homepage done in a worker thread, once every hour, as right now it takes 1 minute to load all images.
    models/feed fetch show images +0ms
    models/feed fetch show images +59s

  - Use DataLoader? https://github.com/facebook/dataloader

### Add About Page
  - Include introduction paragraph there.

### Account page
  - Format more pretty.

  - Show existing information. And how you can update it.

### Show Page
  - Format header better

  - Include poster image for branding on the page.

  - When logged out:
    - Show a prompt in the ChatInput field to enter a username to start logging in.
    - Explain that this creates an account and to be able to access it later you need to add a password.

  - DONE: Disable autocomplete on ChatInput input field

  - Support counting anonymous users in a show page
