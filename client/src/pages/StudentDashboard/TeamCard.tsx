import * as React from 'react';
import "./TeamCard.css";
import { Card, CardContent, Typography, Grid, Button } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import { DashBoardData } from "./LabCard";
import { AuthContext } from "../../components/App/AuthContext";
import useAPI from "../../api";

function TeamCard({ data }: {data: DashBoardData }) {
    const {TeamsApi } = useAPI();
    const { user } = React.useContext(AuthContext);
    return (
        <div className="team-card">
            <Card sx={{ height: 70 }} variant="outlined">
                <CardContent sx={{display: "flex"}}>
                    <Grid container spacing={0} className="team-card-content">
                        <Grid item xs={1}>
                            <GroupIcon className="group-image" color="primary"></GroupIcon>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography className="team-title">
                                {data.Team}
                            </Typography>
                        </Grid>
                        <Grid item xs={2}>
                            {data.Team_Users?.map((d) => (   
                                <Typography key={d.name} className="team-title">
                                    {d.name}
                                </Typography>
                            ))}
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        size="small"
                        className="team-card-button"
                        onClick={() => {
                            data.Team ? TeamsApi.teamsLeaveTeam(data.Team, user?.username || "").then(
                            ) : console.log("ERROR")
                        }}
                    >
                        Leave Team
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default TeamCard;