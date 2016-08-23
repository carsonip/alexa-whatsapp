# Alexa WhatsApp Skill

This project uses Amazon Lambda and Amazon Alexa. It requires a corresponding lambda script to work.

This project uses the [yowsup](https://github.com/tgalal/yowsup) library.

#### Using this project may result in a WhatsApp account ban. Use with great caution.

## Building

Note: The project is developed using Python 2.7 and it is unsure whether it will work on Python 3.

Create your own `credentials.py` according to `credentials.example.py`
 
Run
```shell
pip install -r requirements.txt
python app.py
```

## Usage

Follow the instructions in yowsup to register. It has been pretty messy there.

Here is the most useful one: 
https://github.com/tgalal/yowsup/wiki/Sample-Application#feedback-from-a-newbie-that-got-here

Simply use yowsup-cli to request a code, register and entering the credentials into `credentials.py`.

To define an alias, modify `names.py`. 