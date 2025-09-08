import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Button,
  Divider
} from '@mui/material';

const TarjetaEstadistica = ({ 
  title, 
  count, 
  icon, 
  subtitle, 
  items = [], 
  showMoreText, 
  showMoreColor, 
  onShowMore 
}) => {
  return (
    <Card 
      sx={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        transition: 'box-shadow 0.2s ease',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '450px',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              mr: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#333',
                lineHeight: 1,
                mb: 0.5
              }}
            >
              {count}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333',
                fontWeight: 600
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                mb: 1.5
              }}
            >
              {subtitle}
            </Typography>
            
            <List sx={{ mb: 1.5 }}>
              {items.map((item, index) => {
                // Separar después de cada par (cada 2 elementos)
                const isLastInPair = (index + 1) % 2 === 0;
                const isLastItem = index === items.length - 1;
                
                return (
                  <React.Fragment key={index}>
                    <ListItem 
                      sx={{ 
                        py: 0.5,
                        px: 0,
                        borderBottom: (isLastInPair && !isLastItem) ? '1px solid #e9ecef' : 'none'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {item}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
          
          <Button 
            variant="text"
            sx={{ 
              color: showMoreColor,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              p: 0,
              minWidth: 'auto',
              alignSelf: 'flex-start',
              mt: 'auto',
              '&:hover': {
                opacity: 0.8,
                backgroundColor: 'transparent'
              }
            }}
            onClick={onShowMore}
          >
            {showMoreText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TarjetaEstadistica;
