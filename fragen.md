# Fragen an Carina
## 1. 
**Requirement 5:** [4 points] The 3D models displayed in the application should be able to be provided with a color texture. Furthermore, at least one of the objects must be provided with a color texture.

### Frage:
Soll jedes Objekt (Sphere, Pyramid, AABox, TextureBox, etc..) mit einer Color Textur versehen werden können?

## 2.
**Requirement 4:** [8 points] At least 3 different animation nodes (Scaler - resizes along base axes, Mover - moves an object, Driver - moves along at least two axes in response to keyboard input) must be supported. At least two of the animation nodes must be controllable by the user in a suitable way. At least keyboard input must be supported to start and pause the animation. A constant speed can be assumed for displacements and rotations. The animations must be supported by both renderers.

### Frage: 
Passt unsere manipulation? Wenn man auf box in taskleiste clickt springt diese + Fenster wird minimiert. Mit dem key event "p" können die bewegenden Lightsources gestoppt werden.

## 3.
### Own suggestion:
### Frage:
Können wir unsere Szene grob in Unity nachbauen um diese dann als 3. Rendermöglichkeit (neben Rasterizer und Raytracer) auch als WebXR Szene zu integrieren die in VR und AR verwendet werden kann? So hätten wir einen immersiven 3D Desktop. Dabei würden wir uns aber wahrscheinlich nur auf die Taskbar und Fenster beschränken die dann aber ungefähr genau so animiert wären wie aktuell im Rasterizer (Taskbar Boxen springen wenn sie geklickt werden, Fenster fliegen weg und fliegen wieder zurück). Testen wäre über [WebXR Emulator](https://github.com/meta-quest/immersive-web-emulator) möglich.