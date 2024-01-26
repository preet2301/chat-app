import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export default function BasicTabs({ activeTab, options, handleChange }) {
  return (
    <Tabs
    variant="fullWidth"
      value={activeTab}
      onChange={handleChange}
      aria-label="icon tabs example"
    >
      {options.map((option, index) => (
        <Tab key={`${option}${index}`} icon={option} aria-label="phone" />
      ))}
    </Tabs>
  );
}
