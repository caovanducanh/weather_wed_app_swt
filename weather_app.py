import tkinter as tk
from tkinter import messagebox
import requests
import os
from dotenv import load_dotenv

# ... existing code ...

def get_weather(city):
    # ... existing code ...

def display_weather():
    city = city_entry.get()
    weather_data = get_weather(city)
    
    if weather_data:
        temp = weather_data['main']['temp']
        humidity = weather_data['main']['humidity']
        description = weather_data['weather'][0]['description']
        
        result_label.config(text=f"Temperature: {temp}°C\nHumidity: {humidity}%\nDescription: {description}")
    else:
        messagebox.showerror("Error", "Unable to fetch weather data")

# Create the main window
root = tk.Tk()
root.title("Weather App")
root.geometry("400x300")
root.configure(bg="#f0f0f0")

# Create and pack widgets
title_label = tk.Label(root, text="Weather App", font=("Arial", 20, "bold"), bg="#f0f0f0")
title_label.pack(pady=10)

city_frame = tk.Frame(root, bg="#f0f0f0")
city_frame.pack(pady=10)

city_label = tk.Label(city_frame, text="Enter city:", font=("Arial", 12), bg="#f0f0f0")
city_label.pack(side=tk.LEFT, padx=5)

city_entry = tk.Entry(city_frame, font=("Arial", 12))
city_entry.pack(side=tk.LEFT)

search_button = tk.Button(root, text="Search", command=display_weather, font=("Arial", 12), bg="#4CAF50", fg="white")
search_button.pack(pady=10)

result_label = tk.Label(root, text="", font=("Arial", 12), bg="#f0f0f0", justify=tk.LEFT)
result_label.pack(pady=10)

# Start the GUI event loop
root.mainloop()