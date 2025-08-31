# Run inside backend directory: make -C c_program
CC=gcc
CFLAGS=-O2 -std=c99 -Wall
TARGET=election
SRC=election.c

all:
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET) candidates.csv votes.csv
