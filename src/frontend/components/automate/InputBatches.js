import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';

const CustomInputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1B1B1B',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '215px',
  height: '55px',
  padding: '0 15px',
});

const CustomInput = styled(InputBase)({
  color: 'white',
  fontSize: '1.25rem',
  '& .MuiInputBase-input': {
    textAlign: 'left',
    width: '100%',
    height: '100%',
  },
});

export default function InputBatches({
  title,
  placeHolder,
  value,
  onValueChange,
}) {
  return (
    <div>
      <Typography
        variant='subtitle1'
        color='white'
        fontWeight={600}
        gutterBottom
        style={{ paddingBottom: '1.5px', fontSize: '0.85rem' }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        <CustomInput
          placeholder={placeHolder}
          value={value}
          onChange={onValueChange}
        />
        <Typography
          sx={{
            color: 'white',
            fontWeight: 500,
            marginLeft: 'auto',
          }}
        >
          batches
        </Typography>
      </CustomInputContainer>
    </div>
  );
}
