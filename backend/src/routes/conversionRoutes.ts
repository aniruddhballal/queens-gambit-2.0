import express, { Request, Response } from 'express';
import FileConversion from '../models/FileConversion';

const router = express.Router();

// POST route to log file conversion
router.post('/log-conversion', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, mode } = req.body;

    // Validate request body
    if (!fileName || !mode) {
      res.status(400).json({ 
        success: false, 
        message: 'fileName and mode are required' 
      });
      return;
    }

    if (mode !== 'encode' && mode !== 'decode') {
      res.status(400).json({ 
        success: false, 
        message: 'mode must be either "encode" or "decode"' 
      });
      return;
    }

    // Get IP address from request
    const ipAddress = req.ip || 
                      req.headers['x-forwarded-for'] as string || 
                      req.socket.remoteAddress || 
                      'unknown';

    // Create new conversion record
    const conversion = new FileConversion({
      ipAddress,
      fileName,
      mode
    });

    await conversion.save();

    res.status(201).json({
      success: true,
      message: 'Conversion logged successfully',
      data: conversion
    });
  } catch (error) {
    console.error('Error logging conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging conversion'
    });
  }
});

export default router;