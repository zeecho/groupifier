import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';

import { downloadEmptyScorecardsForPersons } from '../../../../logic/documents/scorecards';
import {
  activityCodeToName,
  competitorsRegisteredForAnEventWithoutGroups,
} from '../../../../logic/activities';
import languageInfo from '../../../../logic/translations';
import { Avatar, ListItemAvatar } from '@material-ui/core';

const OTSScorecards = ({ wcif }) => {
  const missingScorecards = competitorsRegisteredForAnEventWithoutGroups(wcif);
  const [selectedCompetitors, setSelectedCompetitors] = useState(
    missingScorecards.map(c => c.person.wcaUserId)
  );

  const handleCompetitorClick = competitor => {
    const id = competitor.person.wcaUserId;
    setSelectedCompetitors(
      selectedCompetitors.includes(id)
        ? selectedCompetitors.filter(c => c !== id)
        : [...selectedCompetitors, id]
    );
  };

  const competitorSelected = competitor =>
    selectedCompetitors.includes(competitor.person.wcaUserId);

  const isSelectionEmpty = selectedCompetitors.length === 0;

  const [language, setLanguage] = useState('en');
  const [language2, setLanguage2] = useState('');
  const [language3, setLanguage3] = useState('');

  const LanguageSelector = ({
    language,
    setLanguage,
    label,
    includeNoneOption = false,
    withSubheader = false,
    tip = false,
    excludeLanguages = [],
  }) => {
    return (
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            label={label}
          >
            {includeNoneOption && <MenuItem value="">None</MenuItem>}
            {languageInfo
              .filter(l => !excludeLanguages.includes(l.code))
              .map(({ code, originalName, englishName }) => (
                <MenuItem key={code} value={code}>
                  {originalName === englishName
                    ? originalName
                    : `${originalName} (${englishName})`}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>{tip}</FormHelperText>
        </FormControl>
      </Grid>
    );
  };

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Select competitors</Typography>
          <List style={{ width: 400 }}>
            {missingScorecards.map(scorecards => (
              <ListItem
                key={scorecards.person.wcaUserId}
                button
                onClick={() => handleCompetitorClick(scorecards)}
                style={
                  missingScorecards.includes(scorecards) ? {} : { opacity: 0.5 }
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt={scorecards.person.name}
                    src={scorecards.person.avatar?.thumbUrl}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={scorecards.person.name}
                  secondary={scorecards.eventIds
                    .map(eventId => activityCodeToName(`${eventId}-r1`))
                    .join(', ')}
                />
                <Checkbox
                  checked={competitorSelected(scorecards)}
                  tabIndex={-1}
                  disableRipple
                  style={{ padding: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: 16, marginBottom: 16 }}>
        <Tooltip
          placement="left"
          title="Note: in bilingual and trilingual mode, events names will be in this language only"
        >
          <Grid item xs={4}>
            <LanguageSelector
              language={language}
              setLanguage={setLanguage}
              label="Scorecards language"
              tip="Scorecards main language"
            />
          </Grid>
        </Tooltip>
        <Grid item xs={4}>
          <LanguageSelector
            language={language2}
            setLanguage={setLanguage2}
            label="Second scorecards language"
            includeNoneOption
            tip="For bilingual scorecards (optional)"
            excludeLanguages={[language, language3]}
          />
        </Grid>
        {(!(0 in wcif.extensions) ||
          wcif.extensions[0].data.scorecardPaperSize !== 'letter') && (
          <Grid item xs={4}>
            <LanguageSelector
              language={language3}
              setLanguage={setLanguage3}
              label="Third scorecards language"
              includeNoneOption
              tip="For trilingual scorecards (optional)"
              excludeLanguages={[language, language2]}
            />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={1}>
        <Grid item>
          <Button
            onClick={() =>
              downloadEmptyScorecardsForPersons(
                wcif,
                selectedCompetitors,
                language,
                language2,
                language3
              )
            }
            disabled={isSelectionEmpty}
          >
            Scorecards
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OTSScorecards;
