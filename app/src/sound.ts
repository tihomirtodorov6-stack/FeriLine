export function playMessageSound() {

  const audio = new Audio(
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAA"
  );

  audio.volume = 1;

  audio.play().catch((error) => {
    console.log("Sound blocked:", error);
  });

}