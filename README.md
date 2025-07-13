<img width="1148" height="497" alt="Screenshot 2025-07-13 at 3 47 10 AM" src="https://github.com/user-attachments/assets/7112f794-f5cf-49b1-b23d-d1cbc642122f" />
<img width="1148" height="651" alt="Screenshot 2025-07-13 at 3 46 03 AM" src="https://github.com/user-attachments/assets/76bf4c7c-4712-43cc-9073-3b5fefc72426" />


## Inspiration
“Falls are a leading cause of hospitalization and institutionalization for older adults in the US…” affecting 4.5 million older adults in the US every year. Even despite prevention efforts, falls among older adults in the US increase by about 1.5% every year. — University of Michigan

As the human body ages, a fall that could be easily shaken off by you or me could be devastating to an older adult. Yet, many seniors have shown clear reluctance over implementing possibly life-saving assistive technologies in their daily life. Something about these assistive tools are clearly not working for the people they're trying to serve, so what’s not working?

Through extensive user research, we combed through personal interviews, forum discussion insights, and medical journals to uncover the pain points elderly individuals often face with these tools.

### 01 Resistance to surveillance and loss of autonomy

“We got one of these systems for my father. He was living alone after the death of my stepmother. She had fallen in the house before so he knew that it was worth it. He never wore it in the house. When we asked him about it he said he was fine in the house.” — r/Aging

“Privacy concerns of older adults in Taiwan were found to be a dominant deterrent against installing a home surveillance system, with 34 out of 34 participants who did not install a surveillance system citing privacy concerns. Among this group, 24 out of 34 participants (85.29%) were concerned about their visual privacy” — National Library of Medicine

### 02 Fear of losing familiar routines that preserve identity and purpose

“Without a routine I wouldn’t have survived 6 months of retirement. They’d have found me dead on the couch with Netflix automatically going to the next episode of Grey's Anatomy.”

“Hubby and I retired on the same day almost 5 years ago. It's flown by! We have a routine most days and haven't gotten bored yet. Our definition of success is having complete control of our time.” — r/AskOldPeople

### 03 Internalized guilt from depending on a small support network

“I am 67 and i actually try and insulate my children from my health problems. They have enough to deal with in their own lives… The last thing I want is for them to worry about me given the challenges they face establishing themselves in their careers, starting families, learning to be parents, dealing with student loans and so on.” — r/AskOldPeople

“My mom keeps in contact with my grandma’s tenants because sometimes my grandma will lie about where she’s been or how she’s doing as to not inconvenience her” — 5C Student

Ultimately, we realized that because most existing assistive technology for seniors are designed for the caregivers, not the seniors themselves, for many of these older individuals, the cost of staying safe had to come at the expense of feeling monitored, infantilized, or dependent.

This inspired us to center the needs of those most affected and create an assistive tool that prioritizes the user experience of the person being affected. This would give them and their caregivers the assurance of safety without infringing on their personal lives or diminishing their capabilities as functioning adults, allowing for *healthy, balance, trusted connections to form

- How might we provide options/safeguards that give the choice of privacy and discretion back to its user?
- How might we integrate monitoring in a way that feels seamless, invisible, and respectful of their existing routine?
- How might we leverage and coordinate a broader support network so that caregiving feels shared—making it easy for older adults to ask for help without feeling like a burden to any one person?

And thus, O-live, the gentle safety companion was born!

## What it does
- Real-time fall detection with a compact, customizable camera: The app uses AI-powered analysis to detect falls and injuries in real-time through a small, lightweight microcontroller with a camera. We designed and 3D-printed a custom case to make monitoring more flexible and personalized to the daily routines of elderly users.
- Coordinating support network & emergency response: O-live helps bring everyone together by creating a support network for users and notifying their contacts in case of emergencies. If an emergency is detected, the system sends email notifications to this predefined support network (family, friends, neighbours, etc.).
- Image analysis & contextual understanding: We also provide a detailed emergency context with the fall in the message to support network, including potential unconsciousness or injuries using Google Gemini's vision language model.

## How we built it
O-live was built using a combination of hardware and software tools, using cutting-edge technology for real-time fall detection and emergency response:

### Hardware
- ESP32S3 Sense - a microcontroller with a camera to capture real-time frames of the environment.
- Arduino to program the ESP32S3 to send video capture frames over the network to the Flask server for processing.
- TinkerCAD to design and 3D model the casing for the ESP32S3 to hold the camera.

### Software Backend
- Flask framework for hosting server
- Websockets for real-time client-server communication
- Google Gemini Flash 2.0 to analyze the captured images and detect falls, injuries, and unconsciousness, then provide textual feedback and send to the person’s support contact.
- MongoDB for hosting user database online, including the user’s conditions, and their support network information
- Resend API for sending email notifications to the support network of the user in case of an emergency.

### Software Frontend
- React.js for dynamic interface that allows users to interact with the system and see their support network.


## Start backend

```
cd backend
python3 -m venv venv # only need to run once

source venv/bin/activate # on MacOS
venv\Scripts\activate # on Windows

pip install -r requirements.txt # run every time new dependencies are added
```

## To run frontend

In another terminal, run

```
cd frontend
npm install
npm start
```

View the website on http://localhost:3000/ 
