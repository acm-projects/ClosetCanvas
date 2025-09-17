<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Y2dWU3M3AwZDQwOWc0bDZrY2ZtdnZpY255djUwdzJqNjdsbzliNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1AubIMDoGjnsk/giphy.gif" alt="Clothing GIF">
</div>

## 👚 ClosetCanvas 👖

Snap quick photos of everything in your closet and let the app do the rest. ClosetCanvas tags each item, tracks how often you wear it, and builds daily outfits that match the weather and your plans. Forgot about those boots in the corner? ClosetCanvas will remind you—and suggest ways to sell or donate clothes you never use. Wake up each morning to a ready-made outfit and feel good about what’s in your wardrobe.


## MVP 🏆

- **Account creation with User Authentication**
- **Create a sleek navigation system**
- **Closet and individual photo upload** 
- **Rekognition Custom Labels auto-tag garment type/color**
- **GPT-generated “Today’s Outfit” with a reason**
  - Based on calendar events
- **Weather-aware outfit adjustments via OpenWeather API**
- **Dashboard showing wear frequency & “under-worn” alerts**
- **Text morning outfit suggestions**
- **Outfit themes**

## Stretch Goals 💪

- **Try-on AR mirror**
- **Integration with second-hand marketplaces**
- **Social “rate my fit” sharing with friends**
- **Gamification**
  - Badges/Achievements


## Milestones 🎯

<details>
  <summary>Week 1: Set Up ⚙️</summary>
  
  - Discuss with the team who’s frontend/backend and the overall project/tech stack
  - Set up communication and environments
  - Go over GitHub basics:
    - Create branches.
  - Start Figma and start working on UI designs.
  - Learn the basics of the tech stack (watch videos and code along).
<br></details>

<details>
  <summary>Week 2: More Preparation 💡</summary>
  
  - **Front End:**
    - Work on base UI/UX design in Figma
    - Create basic navigation across app pages
    - Begin planning Closet Upload and Home screens
  - **Back End:**
    - Set up user authentication with JWT/Cognito
    - Begin work on image upload handling and storage (e.g., S3)
    - Start researching Rekognition for basic image analysis
    - Work on designing the Schema for the Database/s
  - Work as a team to figure out how the whole app should work.
    - Work out all of the small details, such as how it should flow and general layout.
      - Have an idea in mind to build off by the end of week
    - Make sure everyone is on the same page
<br></details>

<details>
  <summary>Weeks 3-4: Coding 👨🏻‍💻</summary>
  
  - **Front End:**
    - Implement closet gallery UI and item view screens
    - Display GPT-generated outfit with reason on “Today’s Fit” page
    - Add photo capture functionality with preview
  - **Back End:**
    - Integrate GPT API to generate daily outfits
    - Store wear frequency data and last worn timestamp
    - Return filtered item lists for use in suggestions
<br></details>


<details>
  <summary>Weeks 5-6: Middle Stretch 👾</summary>
  
  - **Front End:**
    - LBuild and style wear frequency dashboard
    - Create "under-worn alert" badges next to clothing items
    - Polish UI for full outfit display
  - **Back End:**
    - Create logic for alerting underused clothes
    - Set up SMS morning suggestions
    - Finalize outfit reasoning template from GPT output
    - Begin stretch goals
<br></details>

<details>
  <summary>Weeks 7-8: Finishing Touches 👔</summary>
  
  - Finalize backend and frontend integration by 7th week.
  - Plan and brainstorm for the presentation.
    - Watch previous presentations for inspiration and understanding.
  - Work on stretch goals.
  - Ensure connectivity between frontend and backend.
<br></details>

<details>
  <summary>Weeks 9-10: Wrapping Up/Presentation Night 🗣🎤🖥️</summary>
  
  - Complete any remaining stretch goals.
  - Prepare and practice the presentation.
  - Present to stakeholders.
<br></details>

## Tech Stack 💻

- **React Native**: Building the front end with a focus on interactivity.
  - [Setup Guide](https://reactnative.dev/docs/environment-setup)
  - [How to setup React Native for Beginners](https://www.youtube.com/watch?v=y6DwGxe2E_k&pp=ygUSU2V0dXAgcmVhY3QgbmF0aXZl)
  - [Long React Native Tutorial](https://www.youtube.com/watch?v=0-S5a0eXPoc&pp=ygUSU2V0dXAgcmVhY3QgbmF0aXZl)
- **Express.js**: Backend framework for creating RESTful APIs.
  - [RESTful APIs in 100s](https://www.youtube.com/watch?v=-MTSQjw5DrM) 
- **Node.js**: JavaScript runtime for backend services.
  - [Node Download](https://nodejs.org/en/download/prebuilt-installer)
  - [What is node?](https://www.codecademy.com/article/what-is-node)
    - Optional but you should watch 
- **React Native + Expo + NativeWind (Frontend)**:
  - [React Native Tutorial for Beginners](https://www.youtube.com/watch?v=0-S5a0eXPoc&pp=ygUMcmVhY3QgbmF0aXZl)
  - [TailwindCSS in React Native](https://www.youtube.com/watch?v=qmB6QCua3Uk&pp=ygUKTmF0aXZlV2luZA%3D%3D)
- **AWS Lambda + S3 + Rekognition + API Gateway (Backend)**:
  - [AWS Lambda Tutorial](https://www.youtube.com/watch?v=seaBeltaKhw&pp=ygUKYXdzIGxhbWJkYQ%3D%3D)
  - [AWS S3 Tutorial](https://www.youtube.com/watch?v=tfU0JEZjcsg&pp=ygUCczM%3D)
  - [AWS Rekognition Tutorial](https://www.youtube.com/watch?v=SZa2HfR-9Xc)
  - [Create REST API in AWS](https://www.youtube.com/watch?v=jgpRAiar2LQ&pp=ygULYXBpIGdhdGV3YXk%3D)
- **AWS Cognito (User Authentication)**:
  - [AWS Cognito](https://youtu.be/8a0vtkWJIA4?si=q6s0vENxf4HrNvd0)

## Software to Install </>

-   [Visual Studio Code](https://code.visualstudio.com/)
-   [Git](https://git-scm.com/downloads) (version control)
-   [Node](https://nodejs.org/en/download/prebuilt-installer)

## Other Resources 🗂️

-   [Git cheat sheet](https://education.github.com/git-cheat-sheet-education.pdf)
-   [Git in-depth tutorial](https://youtu.be/RGOj5yH7evk)
-   [Postman set up tutorial](https://youtu.be/3eHJkcA8mTs)    
-   Sign up for [Figma](https://www.figma.com/signup)

## Competitors 🤼

- **Stylebook / Cladwell** (Manual tagging, no AI outfit suggestions)
- **Stitch Fix** (Subscription box model, no personal closet management)
- **Pureple** (Basic color tagging, limited AI styling or usage insights)

## Team ClosetCanvas 🙌

**Developers**
- Tramanh Trinh
- Arnav Vedula   
- Shaleen Amal
- Pragya Singh - the amazing

**Project Manager**
- Noel Emmanuel 

**Industry Mentor**
- Umaymah


