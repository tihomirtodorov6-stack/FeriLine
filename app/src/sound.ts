export function playMessageSound() {

  const audio = new Audio(
    "data:audio/wav;base64,UklGRl9vT19teleWAVEAAAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
  );

  audio.volume = 1;

  audio.play().catch((error) => {
    console.log("Sound blocked:", error);
  });

}