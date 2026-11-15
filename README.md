<div align="center">

# 🎨 Paint & Hide

**A 3D hide-and-seek browser game. Paint yourself to blend in, finish your tasks, and outsmart the seeker.**

### [▶ Play now](https://versha-singh.github.io/paint-and-hide/)

![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Platform](https://img.shields.io/badge/Platform-Laptop%20%7C%20Phone-brightgreen)

<img src="https://github.com/user-attachments/assets/a75be8d7-c67a-4b85-be16-46bf56ae8109"
 alt="Gameplay screenshot" width="500">


</div>

---

## About

You are a blank white blob in an art gallery. Paint your body to match the walls, strike a pose and stay still. A seeker is coming, and it looks for anything that stands out.

The idea for this game was mine, inspired by **Meccha Chameleon** by lemorion_1224. This is my own single-player version, with a gallery setting, three tasks and an AI seeker.

## Game rules

### The goal
Finish all **3 tasks**, then stay hidden for **60 seconds** to win.

### Step by step
1. **Hide phase (60 seconds).** Press **PLAY**. The seeker is not in yet. Paint yourself to match the room and start on your tasks.
2. **Seeker enters.** After 60 seconds the seeker walks in and patrols the rooms. You now have **120 seconds** to finish your tasks.
3. **Finish the tasks.** Once all three are done, the **final countdown** starts. Survive 60 more seconds without being found.

### The 3 tasks
| Task | What to do |
|---|---|
| 🎨 Collect paint pots | Walk into the 3 glowing yellow pots scattered around the gallery |
| 🖼️ Pose at the painting | Stand on the pink circle by the meadow painting and **keep still for 5 seconds** |
| 💧 Water the garden | Stand on the blue circle in the garden for **4 seconds** without the seeker noticing you |

### How the seeker finds you
- The seeker only sees you if you are **in front of it, within range, and nothing blocks the view**.
- The more you **stand out from the background**, the faster the red **Seeker suspicion** bar fills.
- **Moving** and **standing close** to the seeker make it fill faster.
- When the seeker can't see you, the bar slowly drops.
- The green **Hidden** bar shows how well you are blending in right now.

### How you win or lose
| Result | When |
|---|---|
| 🏆 **You win** | All 3 tasks done, then you survive the 60-second final countdown |
| ❌ **Found you** | The suspicion bar reaches 100% |
| ⏱️ **Time up** | The 120 seconds run out before the tasks are done |

### Tips
- Use the **eyedropper (F)** to copy a colour straight from the wall behind you, then paint your body with it.
- Paint **all sides** of your body, since the seeker can see you from any angle.
- **Crouch or sit** to look smaller, and stand against a wall that matches your colours.
- Stay still. Standing still is the strongest way to stay hidden.

## Controls

| Device | Controls |
|---|---|
| Keyboard and mouse | **WASD** move, **mouse** look, **E** paint panel, **V** first/third person, **Q** change pose, **N** map, **M** mute, **G** filter |
| Paint panel | **F** eyedropper, **B** fill body, **C** clear, right-drag to turn your character |
| Gamepad | Left stick move, right stick look, **A** paint, **Y** view, **X** pose |
| Phone | Play in **landscape**. Left thumb moves, right thumb looks, buttons on the right do the rest |

## Features

- A gallery with four connected rooms and a fenced garden
- Paint directly onto a 3D body with a colour picker, eyedropper, fill and brush size
- Four poses: stand, crouch, arms out and sit
- A seeker AI that patrols the rooms and judges how well you blend in
- Three tasks and a final survival countdown
- Minimap and seven visual filters
- Sound effects generated in code, with no audio files
- Works on laptop, gamepad and phone

## How it works

- **Rendering:** Three.js (r128). All textures are drawn in code, so there are no image files.
- **Painting:** each body part has its own small canvas texture. A raycast from the mouse or touch finds the pixel to paint.
- **Seeker vision:** when the seeker has line of sight, the scene is rendered from its view with and without the player. The pixel difference decides how visible you are.
- **Seeker movement:** it travels between rooms along a doorway graph using breadth-first search.
- **Audio:** footsteps, heartbeat and alerts come from the Web Audio API.

## Project structure

```
index.html
style.css
core.js      renderer, scene, procedural textures
world.js     gallery, garden, sky and clouds
player.js    paintable body, spawn effect
seeker.js    seeker model, visibility meter
input.js     controls, camera, painting, movement
ai.js        seeker behaviour
audio.js     sound and filters
game.js      tasks, game flow, minimap, main loop
```

## Run it locally

There is no build step.

1. Open the folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Three.js and the font load from the internet, so you need a connection.

## Credits

Made by **Versha Singh**, with the help of AI (Claude).

