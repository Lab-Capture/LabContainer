import { Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import CircularIndeterminate from "../../components/common/CircularInderminate";

import './StudentDashboard.css'
import { DashBoardData } from "./DashboardCard";
import useData from "../../components/App/useData";
import fetchData from "../../components/App/fetch";
import { AuthContext } from "../../components/App/AuthContext";
import { AnalyticsServiceAPI } from "../../constants";
const sleep = (ms:  number) => new Promise( resolve => setTimeout(resolve, ms))

const DashCard = React.lazy(async () => {
    await sleep(1000)
    return import('./DashboardCard');
})

interface Team {
  name: string,
  lab_id: string
}

interface Lab {
  instructor: string,
  course: string,
  lab_id: string
}

async function getData(user: string, token: string, refresh_token: string, setToken: (s: string) => void){
  const teams : Team[]= await fetchData(AnalyticsServiceAPI, `/teams?username=${user}`, token, refresh_token, setToken, {
    method: 'GET'
  })
  const data : DashBoardData[] = []
  for(let team of teams){
    const lab = await fetchData(AnalyticsServiceAPI, `/labs/${team.lab_id}`, token, refresh_token, setToken, {
      method: 'GET'
    }) as unknown as Lab
    data.push({
      Course: lab.course,
      Instructor: lab.instructor,
      LabName: "sample",
      Progress: 30,
      Team: team.name,
      TimeLeft: "10"
    })
  }
  return data
}

// function useDashboardData(user : string) {
//   const teams : Team[] = useData(AnalyticsServiceAPI, `/teams?username=${user}`,{
//     method: 'GET'
//   }) as unknown as Team[]
//   const labs = teams.map(team => useData(AnalyticsServiceAPI, `/labs/${team.lab_id}`,{
//     method: 'GET'
//   }) as unknown as Lab)
//   const data : DashBoardData[] = []
//   labs.forEach( (lab, index) => {
//     data.push({
//       Course: lab.course,
//       Instructor: lab.instructor,
//       LabName: "smaple",
//       Progress: 30,
//       Team: teams[index].name,
//       TimeLeft: "10"
//     })
//   })
//   return data
// }

export default function StudentDashboard(){
  const {token, refresh_token, setToken, user} = React.useContext(AuthContext)
  
  const [data, setData] = useState<{ 
    data: DashBoardData,
    id: number
  }[]>([])
  useEffect(() => {
    async function run(){
      const data_list = await getData(user.username, token, refresh_token, setToken)
      setData(data_list.map((d, i) => ({
        data: d,
        id: i
      })))
    }
    run()
  }, [user, token, refresh_token, setToken, setData])

  return <>
    <Suspense fallback={<CircularIndeterminate/>}>
    <Container sx={{
      width: "80%",
      justifyContent: "space-evenly"
    }}>
      {data.map(d =>  <DashCard data={d.data} key={d.id}/>)}

    </Container>
    </Suspense>
  </>
}

