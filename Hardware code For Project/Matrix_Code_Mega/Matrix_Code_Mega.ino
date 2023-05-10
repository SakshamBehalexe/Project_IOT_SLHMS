// Name : Gaurish Bhatia
// Student ID: 2110994762
// Smart Lecture Hall Management
// Remarks : This is the code for the 64x64 LED Matrix screen.



#include <DHT.h>
#include <DHT_U.h>

#include <VirtualWire.h>

#define DHTTYPE DHT11


String message = "";

// testshapes demo for RGBmatrixPanel library.
// Demonstrates the drawing abilities of the RGBmatrixPanel library.
// For 64x64 RGB LED matrix.

// WILL NOT FIT on ARDUINO UNO -- requires a Mega, M0 or M4 board

#include "RGBmatrixPanel.h"

#include "bit_bmp.h"
#include "fonts.h"
#include <string.h>
#include <stdlib.h>


// Most of the signal pins are configurable, but the CLK pin has some
// special constraints.  On 8-bit AVR boards it must be on PORTB...
// Pin 11 works on the Arduino Mega.  On 32-bit SAMD boards it must be
// on the same PORT as the RGB data pins (D2-D7)...
// Pin 8 works on the Adafruit Metro M0 or Arduino Zero,
// Pin A4 works on the Adafruit Metro M4 (if using the Adafruit RGB
// Matrix Shield, cut trace between CLK pads and run a wire to A4).

//#define CLK  8   // USE THIS ON ADAFRUIT METRO M0, etc.
//#define CLK A4 // USE THIS ON METRO M4 (not M0)
#define CLK 11 // USE THIS ON ARDUINO MEGA
#define OE   9
#define LAT 10
#define A   A0
#define B   A1
#define C   A2
#define D   A3
#define E   A4
#define DHTPIN 2

RGBmatrixPanel matrix(A, B, C, D, E, CLK, LAT, OE, false, 64);
//Configure the serial port to use the standard printf function

int x = 64;
DHT dht(DHTPIN, DHTTYPE);
void setup()
{
  Serial.begin(9600);

  dht.begin();
  vw_set_rx_pin(4); // set the receiver pin
  vw_setup(2000); // set the data rate to 2000 bits per second
  vw_rx_start(); // start the receiver
  attachInterrupt(digitalPinToInterrupt(4), isr, CHANGE);

}



void loop()
{
  uint8_t buffer[VW_MAX_MESSAGE_LEN]; // create a buffer to store incoming data
  uint8_t buffer_size = VW_MAX_MESSAGE_LEN; // get the maximum buffer size

  if (vw_get_message(buffer, &buffer_size)) {

    matrix.begin();
    matrix.setTextSize(2);
    matrix.setRotation(2);// Set the text size to 2
    matrix.setTextWrap(false); // Disable text wrapping
    delay(500);// check if a message has been received
    // Message with a good checksum received
    String msg = "";
    for (int i = 2; i < buffer_size; i++) {
      msg += (char)buffer[i];
    }
    Serial.print("Message: ");
    Serial.println(msg);
    message = msg;
    int i = 0;
    vw_rx_stop();
    while (1)
    {



      // Display scrolling text
      matrix.setTextColor(matrix.Color333(0, 0, 255));
      matrix.setTextSize(2);
      matrix.setCursor(8, 25);
      matrix.print("LH-5");

      matrix.setTextSize(1);
      float h = dht.readHumidity();
      // Read temperature as Celsius (the default)
      float t = dht.readTemperature();

      matrix.setCursor(3, 44);
      matrix.setTextColor(matrix.Color333(255, 255, 255));
      matrix.print("Temp: ");
      matrix.setTextColor(matrix.Color333(255, 0, 0));
      matrix.setCursor(32, 44);
      matrix.setTextSize(1);
      matrix.fillRect(32, 44, 64, 8, matrix.Color333(0, 0, 0));
      matrix.print(t);

      matrix.setCursor(3, 53);
      matrix.setTextSize(0.75);
      matrix.setTextColor(matrix.Color333(255, 255, 255));
      matrix.print("Hum.: ");
      matrix.setTextColor(matrix.Color333(255, 0, 0));
      matrix.setCursor(32, 53);
      matrix.setTextSize(0.5);
      matrix.fillRect(32, 53, 64, 8, matrix.Color333(0, 0, 0));
      matrix.print(h);




      while (x > -120)
      {

        // Clear the display
        matrix.setTextSize(2);
        matrix.setTextColor(matrix.Color333(7, 0, 7));
        matrix.setCursor(x, 5); // Set the text position
        matrix.print(msg); // Print the text
        matrix.setTextColor(matrix.Color333(0, 0, 0));
        matrix.setCursor(x, 5);
        matrix.print(msg); // Print the text

        x = x - 3;

      }

      x = 64;

    }







  }











}

void isr() {
  vw_rx_start();
  
}

//Clear screen
void screen_clear()
{
  matrix.fillRect(0, 0, matrix.width(), matrix.height(), matrix.Color333(0, 0, 0));
}





void display_text(int x, int y, char *str, const GFXfont *f, int color, int pixels_size)
{
  matrix.setTextSize(pixels_size);// size 1 == 8 pixels high
  matrix.setTextWrap(false); // Don't wrap at end of line - will do ourselves
  matrix.setFont(f);      //set font
  matrix.setCursor(x, y);
  matrix.setTextColor(color);
  matrix.println(str);
}
