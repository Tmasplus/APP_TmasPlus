import React from 'react';
import {
    Grid,
    TextField,
    FormControlLabel,
    Checkbox
} from '@mui/material';

import { useTranslation } from "react-i18next";

export default function OtherPerson(props){
    const { t, i18n  } = useTranslation();
    const isRTL = i18n.dir();
    const { classes, otherPerson, handleChange, setOtherPerson, instructionData } = props;
    return (
        <Grid>
         <FormControlLabel
              control={
                <Checkbox checked={otherPerson} onChange={() => setOtherPerson(!otherPerson)} name={t('Observaciones del servicio')} />
              }
              label={t('Observaciones del servicio')}
            />
            {otherPerson ?
            <Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="otherPerson"
                  label={t('otherPerson')}
                  name="otherPerson"
                  autoComplete="otherPerson"
                  onChange={handleChange}
                  value={instructionData.otherPerson}
                  //autoFocus
                  className={isRTL==='rtl'?classes.inputRtl:classes.textField}
                  style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="otherPersonPhone"
                  label={t('otherPersonPhone')}
                  name="otherPersonPhone"
                  autoComplete="otherPersonPhone"
                  type="number"
                  onChange={handleChange}
                  value={instructionData.otherPersonPhone}
                  className={isRTL==='rtl'?[classes.inputRtl, classes.rightRty]:classes.textField}
                  style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
                />
              </Grid>
            </Grid>
            : null }   
        </Grid>
    );
}