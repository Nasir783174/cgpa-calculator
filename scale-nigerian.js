const SCALES = { nigerian: { max:5, grades:[{label:"A  (5.00)",value:5,letter:"A"},{label:"B  (4.00)",value:4,letter:"B"},{label:"C  (3.00)",value:3,letter:"C"},{label:"D  (2.00)",value:2,letter:"D"},{label:"E  (1.00)",value:1,letter:"E"},{label:"F  (0.00)",value:0,letter:"F"}] } };
let currentScale="nigerian", semesterCount=0, sgpaRowCount=0;
document.addEventListener("DOMContentLoaded", initCalculator);
