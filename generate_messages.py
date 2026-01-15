#!/usr/bin/env python3
"""
ParentSquare Positive Message Generator
Generates personalized positive behavior messages for students
"""

import csv
import sys
import os


class PronounSet:
    """Stores pronoun variations for a student"""
    def __init__(self, pronouns_str):
        self.pronouns_str = pronouns_str.lower().strip()

        # Map common pronoun formats to subject/object/possessive
        if self.pronouns_str in ['he/him', 'he']:
            self.subject = 'he'
            self.object = 'him'
            self.possessive = 'his'
        elif self.pronouns_str in ['she/her', 'she']:
            self.subject = 'she'
            self.object = 'her'
            self.possessive = 'her'
        elif self.pronouns_str in ['they/them', 'they']:
            self.subject = 'they'
            self.object = 'them'
            self.possessive = 'their'
        else:
            # Default to they/them for unknown
            self.subject = 'they'
            self.object = 'them'
            self.possessive = 'their'

    def subject_cap(self):
        """Return capitalized subject pronoun"""
        return self.subject.capitalize()

    def object_cap(self):
        """Return capitalized object pronoun"""
        return self.object.capitalize()

    def possessive_cap(self):
        """Return capitalized possessive pronoun"""
        return self.possessive.capitalize()


def load_student_roster(roster_file='student_roster.csv'):
    """Load student information from CSV file"""
    students = {}

    if not os.path.exists(roster_file):
        print(f"ERROR: Student roster file '{roster_file}' not found!")
        print("Please create a student_roster.csv file with columns: student_name,pronouns")
        sys.exit(1)

    with open(roster_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['student_name'].strip()
            pronouns = row['pronouns'].strip()
            students[name.lower()] = {
                'name': name,
                'pronouns': PronounSet(pronouns)
            }

    return students


def parse_input_file(input_file='behaviors.txt'):
    """Parse input file with format: Student Name - behavior description"""
    behaviors = []

    if not os.path.exists(input_file):
        print(f"ERROR: Input file '{input_file}' not found!")
        print("Please create a behaviors.txt file with format:")
        print("Student Name - behavior description")
        sys.exit(1)

    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Parse "Student Name - behavior" format
            if ' - ' in line:
                student_name, behavior = line.split(' - ', 1)
                behaviors.append({
                    'student_name': student_name.strip(),
                    'behavior': behavior.strip(),
                    'line_num': line_num
                })
            else:
                print(f"WARNING: Line {line_num} doesn't match format 'Student Name - behavior': {line}")

    return behaviors


def generate_message(student_name, behavior, pronouns):
    """Generate a personalized positive message"""
    # Clean up behavior text - ensure it's lowercase if it continues a sentence
    behavior = behavior.strip()

    # Build the message
    message = f"Hi! I wanted to let you know that {student_name} {behavior}. "
    message += f"{pronouns.subject_cap()} did a great job!"

    return message


def main():
    print("=" * 70)
    print("ParentSquare Positive Message Generator")
    print("=" * 70)
    print()

    # Load student roster
    print("Loading student roster...")
    students = load_student_roster()
    print(f"✓ Loaded {len(students)} students")
    print()

    # Parse input file
    print("Loading behaviors from behaviors.txt...")
    behaviors = parse_input_file()
    print(f"✓ Found {len(behaviors)} positive behaviors to send")
    print()

    if not behaviors:
        print("No behaviors found in behaviors.txt. Add some positive notes and try again!")
        return

    # Generate messages
    print("=" * 70)
    print("MESSAGES TO SEND (Copy each message for the corresponding student)")
    print("=" * 70)
    print()

    messages_generated = 0
    for behavior_entry in behaviors:
        student_name = behavior_entry['student_name']
        behavior = behavior_entry['behavior']

        # Look up student (case-insensitive)
        student_key = student_name.lower()
        if student_key not in students:
            print(f"⚠ WARNING: '{student_name}' not found in roster (line {behavior_entry['line_num']})")
            print(f"   Skipping this entry. Please add to student_roster.csv")
            print()
            continue

        student = students[student_key]
        message = generate_message(student['name'], behavior, student['pronouns'])

        print(f"📧 STUDENT: {student['name']}")
        print(f"   (Search for this name in ParentSquare's 'To:' field)")
        print()
        print(f"   MESSAGE:")
        print(f"   {message}")
        print()
        print("-" * 70)
        print()

        messages_generated += 1

    print(f"✓ Generated {messages_generated} messages!")
    print()
    print("INSTRUCTIONS:")
    print("1. Open ParentSquare in your browser")
    print("2. For each student above:")
    print("   a. Type their name in the 'To:' field")
    print("   b. Select the parent(s) from the dropdown")
    print("   c. Copy and paste the message")
    print("   d. Send!")


if __name__ == '__main__':
    main()
