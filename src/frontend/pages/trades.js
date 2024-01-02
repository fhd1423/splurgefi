import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import {
  DynamicContextProvider,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase } from '../components/supabase/client';
import sendSupabaseRequest from '../components/supabase/supabaseClient';

//Should add arbiscan links for completed batches
//UI color response in NavBar for when a tab is selected
//Feedback widget on every page(just a textbox that says send)

const EnhancedTableToolbar = ({ numSelected, onDeleteSelected }) => (
  <Toolbar
    sx={{
      pl: { sm: 2 },
      pr: { xs: 1, sm: 1 },
      bgcolor: numSelected > 0 ? '#03C988' : '#2B2B2B',
    }}
  >
    {numSelected > 0 ? (
      <Typography
        sx={{ flex: '1 1 100%' }}
        color='inherit'
        variant='subtitle1'
        component='div'
      >
        {numSelected} selected
      </Typography>
    ) : (
      <Typography
        sx={{
          flex: '1 1 100%',
          color: '#D9D9D9',
          fontWeight: 'bold',
        }}
        variant='h6'
        id='tableTitle'
        component='div'
      >
        Trade History
      </Typography>
    )}
    {numSelected > 0 ? (
      <Tooltip title='Delete'>
        <IconButton onClick={onDeleteSelected}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ) : null}
  </Toolbar>
);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};
export default function Trades() {
  const { setShowAuthFlow, primaryWallet, authToken } = useDynamicContext();
  const [userTrades, setUserTrades] = useState(new Map());
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getNameFromPair = async (pair) => {
    console.log('PAIR', pair);
    const { data: payingETH } = await supabase
      .from('Pairs')
      .select('tokenName')
      .eq('path', pair);

    if (payingETH[0]) return `WETH-${payingETH[0].tokenName}`;
    else {
      const { data: payingToken } = await supabase
        .from('Pairs')
        .select('tokenName')
        .eq('path', `${pair.split('-')[1]}-${pair.split('-')[0]}`);

      if (payingToken[0]) return `${payingToken[0].tokenName}-WETH`;
      return `Unkown Trade Pair`;
    }
  };

  const handleSelect = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
      // updateTradeStatus(id); // Call updateTradeStatus for the selected trade
    } else {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleSelectAllClick = async (event) => {
    if (event.target.checked) {
      const newSelected = tradeRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const tradeStoppedPressed = async () => {
    await Promise.all(selected.map((id) => updateTradeStatus(id)));
    setSelected([]);
    fetchTrades();
    return;
  };

  async function updateTradeStatus(tradeId) {
    try {
      // const { data, error } = await supabase
      //   .from('Trades')
      //   .update({ ['tradeStopped']: true })
      //   .eq('id', tradeId);

      // if (error) throw error;
      const result = await sendSupabaseRequest(authToken, {
        user: primaryWallet.address,
        tradeId: tradeId,
      });

      console.log('Trade updated successfully:', data);
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  }

  const fetchTrades = async () => {
    if (primaryWallet?.address) {
      const data = await sendSupabaseRequest(authToken, {});
      console.log(data);

      const tradesPromises = data.map(async (trade) => ({
        id: trade.id,
        details: [
          await getNameFromPair(trade.pair),
          trade.pair,
          trade.complete,
          trade.order.tranches,
          trade.order.percentChange,
          trade.order.deadline,
          trade.remainingBatches,
          trade.tradeStopped,
          trade.failedSimulation,
          trade.amountRecieved,
        ],
      }));

      const tradesResults = await Promise.all(tradesPromises);
      let newTrades = new Map(
        tradesResults.map((item) => [item.id, item.details]),
      );

      setUserTrades(newTrades);
    }
  };

  useEffect(() => {
    // Update remaining balances
    fetchTrades();
  }, [primaryWallet?.address]);

  const tradeRows = Array.from(userTrades).map(
    ([
      id,
      [
        tokenName,
        pair,
        complete,
        batches,
        percentChange,
        deadline,
        remainingBatches,
        tradeStopped,
        failedSimulation,
        amountRecieved,
      ],
    ]) => ({
      id,
      sell: tokenName.split('-')[0],
      buy: tokenName.split('-')[1],
      batches,
      percentChange: `${
        tokenName.split('-')[0] === 'WETH'
          ? `-${percentChange}`
          : `+${percentChange}`
      }%`,
      date: new Date(deadline * 1000).toLocaleString(),
      status: complete
        ? 'Complete'
        : `Pending (${batches - remainingBatches}/${batches})`,
      tradeStopped,
      failedSimulation,
      amountRecieved,
    }),
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-stone-900 to-emerald-900 flex flex-col'>
      <NavBar inTradesPage={true} />
      <div className='h-screen flex flex-col justify-start items-start pt-12 pl-10'>
        <DynamicContextProvider
          settings={{
            environmentId: 'a8961ac2-2a97-4735-a2b2-253f2485557e',
            walletConnectors: [EthereumWalletConnectors],
            siweStatement:
              'Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet.',
          }}
        >
          <Head>
            <title>Trades</title>
            <link rel='icon' href='/favicon.ico' />
          </Head>

          <div className='w-full flex justify-between items-center p-4'>
            <h1 className='text-4xl text-white font-semibold'>Trades</h1>
          </div>

          {userTrades.size > 0 ? (
            <div className='h-screen flex flex-col justify-start items-start pt-8 pl-5 pr-5'>
              <TableContainer
                component={Paper}
                sx={{
                  width: '1360px',
                  margin: 'auto',
                  mt: 4,
                  align: 'left',
                  bgcolor: '#1B1B1B',
                }}
              >
                <EnhancedTableToolbar
                  numSelected={selected.length}
                  onDeleteSelected={handleOpen}
                />

                <Table sx={{ minWidth: 1180 }} aria-label='customized table'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#2B2B2B' }}>
                      <TableCell
                        padding='checkbox'
                        sx={{ borderBottom: 'none' }}
                      >
                        <Checkbox
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < tradeRows.length
                          }
                          checked={
                            tradeRows.length > 0 &&
                            selected.length === tradeRows.length
                          }
                          onChange={(event) => handleSelectAllClick(event)}
                          sx={{
                            color: 'white',
                            '&.Mui-checked': {
                              color: '#50D890',
                              opacity: '0.85',
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: '#50D890',
                              opacity: '0.85',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Sell
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Buy
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Batches
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Percent Change
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Deadline
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'white',
                          borderBottom: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Amount Recieved
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tradeRows.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:nth-of-type(odd)': { bgcolor: '#1B1B1B' },
                          '&:nth-of-type(even)': { bgcolor: '#1B1B1B' },
                          '& td, & th': {
                            borderColor:
                              tradeRows.length === 1
                                ? 'transparent'
                                : '#5D5D5D',
                            borderBottom:
                              tradeRows.length === 1
                                ? 'none'
                                : '1px solid #5D5D5D',
                            color: 'white',
                          },
                        }}
                      >
                        <TableCell padding='checkbox'>
                          <Checkbox
                            color='primary'
                            checked={selected.indexOf(row.id) !== -1}
                            onClick={(event) => handleSelect(event, row.id)}
                            sx={{
                              color: 'white',
                              '&.Mui-checked': {
                                color: '#50D890',
                                opacity: '0.85',
                              },
                              '&.MuiCheckbox-indeterminate': {
                                color: '#50D890',
                                opacity: '0.85',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell component='th' scope='row'>
                          {row.sell}
                        </TableCell>
                        <TableCell>{row.buy}</TableCell>
                        <TableCell>{row.batches}</TableCell>
                        <TableCell>{row.percentChange}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        {/* <TableCell>
                          {row.tradeStopped
                            ? 'Cancelled'
                            : row.failedSimulation
                            ? 'Failed Simulation'
                            : row.status}
                        </TableCell> */}
                        <TableCell>
                          {row.tradeStopped ? (
                            <span style={{color: red}}>Cancelled</span>
                          ) : row.failedSimulation ? (
                            <span style={{color: red}}>Failed Simulation</span>
                          ) : row.status === 'Complete' ? (
                            <a
                              href={`https://arbiscan.io/advanced-filter?fadd=0x2c5c7dbe16685e1371f4caeaf586c6cabffc4252&txntype=2&tadd=${primaryWallet?.address}`}
                              className='hover:underline'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <span style={{color: green}}>Complete</span>
                            </a>
                          ) : (
                            <span style={{color: yellow}}>row.status</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.amountRecieved
                            ? row.amountRecieved / 1e18
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <h3 className='text-white p-4'>
              No trades linked to account. Please make sure you connect your
              wallet or refresh the page.
            </h3>
          )}

          <div>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby='modal-modal-title'
              aria-describedby='modal-modal-description'
            >
              <Box sx={style}>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Button
                    onClick={handleClose}
                    sx={{
                      // Override the hover color
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: '#9F9F9F',
                      },
                      // Override the focus color
                      '&:focus': {
                        bgcolor: 'transparent',
                        color: '#9F9F9F',
                      },
                    }}
                  >
                    <CloseIcon sx={{ color: '#9F9F9F' }} />
                  </Button>
                </Box>
                <Typography id='modal-modal-title' variant='h6' component='h2'>
                  Confirm trade cancellation.
                </Typography>

                <Typography id='modal-modal-description' sx={{ mt: 2 }}>
                  Once you cancel your trade, your remaining batches will not
                  execute.
                </Typography>
                <Button
                  variant='outlined'
                  color='error'
                  sx={{ mt: 2 }}
                  onClick={async () => {
                    await tradeStoppedPressed(); // Wait for tradeStopped to complete
                    handleClose();
                  }}
                >
                  Stop Trade
                </Button>
              </Box>
            </Modal>
          </div>
        </DynamicContextProvider>
      </div>
    </div>
  );
}

// https://arbiscan.io/advanced-filter?fadd=0x2c5c7dbe16685e1371f4caeaf586c6cabffc4252&txntype=2&tadd=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596
