# ParentSquare Bulk Positive Message Tool

A simple tool to make it easier to send personalized positive behavior messages to multiple parents through ParentSquare.

## What This Tool Does

Instead of manually writing the same message multiple times with different names and pronouns, this tool:
1. Takes a simple list of students and what they did well
2. Automatically generates personalized messages with correct pronouns
3. Outputs messages ready to copy/paste into ParentSquare

## Quick Start

### 1. Set Up Your Student Roster (One-Time Setup)

Edit `student_roster.csv` with your students:

```csv
student_name,pronouns
Johnny Smith,he/him
Sarah Jones,she/her
Alex Kim,they/them
Maria Garcia,she/her
```

### 2. List Today's Positive Behaviors

Edit `behaviors.txt` with students who did well today:

```
Johnny Smith - was focused in class today
Sarah Jones - helped a classmate with their math assignment
Alex Kim - showed excellent problem-solving skills
```

### 3. Generate Messages

Run the script:

```bash
python3 generate_messages.py
```

### 4. Copy to ParentSquare

The tool outputs personalized messages like:

```
📧 STUDENT: Johnny Smith
   (Search for this name in ParentSquare's 'To:' field)

   MESSAGE:
   Hi! I wanted to let you know that Johnny Smith was focused in class today. He did a great job!
```

Then:
1. Open ParentSquare
2. Type "Johnny Smith" in the To: field
3. Select the parent(s) from dropdown
4. Copy/paste the message
5. Send!

## File Descriptions

- **student_roster.csv** - Your master list of students and pronouns (update once at start of year)
- **behaviors.txt** - Daily input file where you list students and what they did well
- **generate_messages.py** - The script that generates personalized messages

## Tips

### Writing Behaviors

Start behaviors with a verb so they flow naturally:
- ✅ "was focused in class today"
- ✅ "helped a classmate with math"
- ✅ "showed excellent leadership"
- ❌ "focus in class" (doesn't flow well)

The message template is: "I wanted to let you know that [Name] [your behavior text]. [Pronoun] did a great job!"

### Pronouns

Supported formats:
- `he/him` or `he`
- `she/her` or `she`
- `they/them` or `they`

### Comments in behaviors.txt

Lines starting with `#` are ignored, so you can add notes:

```
# Period 1 - Great participation today!
Johnny Smith - was focused in class today
Sarah Jones - helped a classmate

# Period 2 - Need to send these by Friday
Alex Kim - showed excellent problem-solving skills
```

## Customizing Messages

To change the message template, edit the `generate_message()` function in `generate_messages.py` around line 111.

## Requirements

- Python 3.6 or higher (usually pre-installed on Mac/Linux)
- No additional packages needed - uses only Python standard library!

## Troubleshooting

**"Student not found in roster"** - Add the student to `student_roster.csv`

**"File not found"** - Make sure you're running the script from the project directory

**Wrong pronouns** - Update the student's pronouns in `student_roster.csv`
