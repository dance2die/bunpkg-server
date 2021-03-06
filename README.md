# What?
Backend code for [Bunpkg.com](https://bunpkg.com/).  
Here is a demo.

[![Demo Video](https://img.youtube.com/vi/67MQcDrDNg4/0.jpg)](https://youtu.be/67MQcDrDNg4)

## Frontend code
Source code is available on [dance2die/bunpkg-client](https://github.com/dance2die/bunpkg-client).

# Why?
A few reasons
1. Inspired by Michael Jackson on how he got started with UNPKG on React Podcast Episode 19, "[Supporting Open Source with Michael Jackson](https://reactpodcast.simplecast.fm/19)".
1. To make it easier to generate `<script>` tags for UNPKG.
1. To learn continuously.

# ToDo
* Iron out bugs - When back-end running on Heroku is unreachable, notify users
* Learn how to set up Redis to cache package names & version info
* Learn how to use CloudFlare API
* After caching works, make it work like CodeSandBox "Add Dependency" dialog box
* Make it available offline (PWA)
