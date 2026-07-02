#!/bin/bash
sed -i '1016,1040c\
                   onClick={() => setShowCheckoutWarning(true)}' src/App.tsx
