import React from 'react'
import { Lab } from '../../clients/AnalyticsClient'

function LabInfo({lab} : {lab: Lab}) {
  return (
    <div className="lab-section">
        <h3>Lab Information</h3>
    
        <h4>{lab.name}</h4>
        <h6>
          Course Name: {lab.course} | Instructor:{lab.instructor}
        </h6>
        <p style={{ width: "100%" }}>
          <b>Lab Description:</b> {lab.description}
        </p>
        <p>
          <b>Due:</b> {lab.deadline}
        </p>
    </div>
  )
}

export default LabInfo