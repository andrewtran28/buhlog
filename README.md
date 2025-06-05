# Buhlog (/bla:g/)

A showcase for a simple blog website called Buhlog (pronounced the same as "blog"). The Buhlog project consists of a monorepo containing both frontend and backend capabilties. The website allows for users to view the posts written by an author (i.e., me) using a HTML rich text editor (Quill.js). Also implemented is the ability to upload and/or paste in images right into the blog posts, where these images are stored and managed within a secure AWS S3 bucket. Other features include user authentication, commenting on posts, and saving draft posts (as an author).

This project's back-end framework was initially developed using Node.js and Express to allow for server and database blog functionalities. However, to challenge myself and learn a new framework, I have also re-create the entire back-end using the Flask framework written in Python. Both back-end servers co-exist and are virtually identical --Even sharing the same PostgreSQL database. Please note that the Node.js iteration is the definitive version, and so the Flask version may have depricated or non-functioning features (until later implemented).

## Live Preview

- Node.js Version (Original): https://buhlog.netlify.app/

  ![buhlog](https://github.com/user-attachments/assets/c5778387-390b-46e6-bcf9-831dd4042e14)

- Python-Flask Version: https://buhlog-python.netlify.app/

  ![buhlog-python](https://github.com/user-attachments/assets/b4c2c394-a85b-48d6-972a-2377bb4964ff)

## Technology Used

- React + Vite
- HTML
- CSS
- Quill.js (HTML rich text editor)
- JavaScript (TypeScript)
- Node.js + Express
  - Passport
- Python + Flask
- Netlify (for hosting the static website)
- Render (for hosting web server)
- Neon DB (for hosting PSQL database)
- AWS S3 (for storing and managing post images)
