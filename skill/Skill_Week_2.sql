CREATE DATABASE student_management;
USE student_management;
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(50),
    department VARCHAR(30),
    age INT,
    marks INT,
    city VARCHAR(30)
);

INSERT INTO students VALUES
(101,'Priyanka','CSIT',19,92,'Hyderabad'),
(102,'Rahul','CSE',20,85,'Delhi'),
(103,'Ananya','CSIT',19,78,'Hyderabad'),
(104,'Kiran','ECE',21,67,'Chennai'),
(105,'Sneha','CSE',20,95,'Mumbai'),
(106,'Arjun','CSIT',22,88,'Bangalore'),
(107,'Meena','ECE',20,73,'Chennai'),
(108,'Ravi','CSE',21,81,'Delhi'),
(109,'Divya','CSIT',19,96,'Mumbai'),
(110,'Varun','ECE',22,59,'Hyderabad');
SELECT * FROM students;

SELECT *
FROM students
WHERE marks > 80;

SELECT *
FROM students
WHERE department = 'CSIT';

SELECT *
FROM students
WHERE city = 'Hyderabad';

SELECT *
FROM students
ORDER BY marks DESC;

SELECT *
FROM students
ORDER BY marks;

SELECT AVG(marks) AS average_marks
FROM students;

SELECT MAX(marks) AS highest_marks
FROM students;

SELECT MIN(marks) AS lowest_marks
FROM students;

SELECT COUNT(*) AS total_students
FROM students;

SELECT department,
       COUNT(*) AS total_students
FROM students
GROUP BY department;

SELECT department,
       AVG(marks) AS average_marks
FROM students
GROUP BY department;

SELECT department,
       MAX(marks) AS highest_marks
FROM students
GROUP BY department;

SELECT department,
       MIN(marks) AS lowest_marks
FROM students
GROUP BY department;

SELECT department,
       AVG(marks) AS average_marks
FROM students
GROUP BY department
HAVING AVG(marks) > 80;

SELECT department,
       COUNT(*) AS total_students
FROM students
GROUP BY department
HAVING COUNT(*) > 2;

SELECT department,
       AVG(marks) AS average_marks
FROM students
GROUP BY department
HAVING AVG(marks) > 70
ORDER BY average_marks DESC;

SELECT *
FROM students
WHERE marks BETWEEN 70 AND 90;

SELECT city,
       COUNT(*) AS total_students
FROM students
GROUP BY city
HAVING COUNT(*) > 2;

SELECT department,
       AVG(marks) AS average_marks
FROM students
GROUP BY department
HAVING AVG(marks) BETWEEN 70 AND 90;

SELECT department,
       MAX(marks) AS highest_marks
FROM students
GROUP BY department
ORDER BY highest_marks DESC;