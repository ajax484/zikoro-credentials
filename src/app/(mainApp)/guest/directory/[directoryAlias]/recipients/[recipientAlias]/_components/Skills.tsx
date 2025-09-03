import { DirectoryRecipient } from "@/types/directories";
import { set } from "date-fns";
import React, { use, useEffect, useState } from "react";

const Skills = ({ recipient }: { recipient: DirectoryRecipient }) => {
  // extract skills into {label, count}
  const [skills, setSkills] = useState<{ label: string; count: number }[]>([]);
  console.log(recipient?.assignedCertificates);
  
  useEffect(() => {
    const extractSkills = () => {
      if (!recipient?.assignedCertificates?.length) {
        return [];
      }

      const skillCounts = recipient.assignedCertificates.reduce((acc, curr) => {
        if (!curr.certificate?.certificateSettings.skills) return acc;
        console.log(curr.certificate?.certificateSettings.skills);
        curr.certificate?.certificateSettings.skills.forEach((skill) => {
          const value = skill.value;
          acc.set(value, (acc.get(value) || 0) + 1);
        });
        console.log(acc);
        return acc;
      }, new Map());

      return Array.from(skillCounts, ([label, count]) => ({ label, count }));
    };

    setSkills(extractSkills());
  }, [recipient]);

  return (
    <div className="flex justify-center">
      <div className="flex justify-center gap-2 flex-wrap w-3/4">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="rounded-xl text-zikoroBlack px-2 py-1 border"
          >
            {skill.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
