import React from "react";

const skills = [
  "Communication",
  "Leadership",
  "Teamwork",
  "Problem Solving",
  "Time Management",
  "Decision Making",
  "Creativity",
  "Adaptability",
];

const Skills = () => {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center gap-2 flex-wrap w-1/2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="rounded-xl text-zikoroBlack px-2 py-1 border"
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
