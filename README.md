# harrytv


# Todo

Homepage:
  DONE: Add introduction paragraph at the top of the page explaining what the website is.
    ex.) Welcome to HarryTV, the best place to have a real time chat about TV shows that you're watching! HarryTV connects you with tv fans from around the world from the comfort of your couch. While you enjoy watching your newest episode chat about it with other fans on HarryTV!

  DONE: Tune the update algorithm, should update once every hour, on the hour.

  DONE: Show count of how many people are in each chatroom on the home page so you know where conversations are

  DONE: Additionally Group shows that have people chatting at top and rest at the bottom.


Infra:
  DONE: If a user can not log in then just log them out and clear localStorage.
    if the refresh token goes bad or the localStorage gets corrupted.

  Self host images
    https://github.com/lovell/sharp

  Favicon.

  Make updating homepage done in a worker thread, once every hour, as right now it takes 1 minute to load all images.
    models/feed fetch show images +0ms
    models/feed fetch show images +59s

  Use DataLoader? https://github.com/facebook/dataloader

Add About Page
  Include introduction paragraph there.

Account page:
  Format more pretty.

  Show existing information. And how you can update it.

Show Page:
  Format header better

  Include poster image for branding on the page.

  When logged out:
    Show a prompt in the ChatInput field to enter a username to start logging in.
    Explain that this creates an account and to be able to access it later you need to add a password.

  Disable autocomplete on ChatInput input field

  Support counting anonymous users in a show page
