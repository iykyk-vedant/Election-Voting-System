/*
  election.c
  Simple C program to manage candidates & votes via CSV files.
  Commands:
    ./election add <id> <name>
    ./election vote <voterId> <candidateId>
    ./election list_candidates
    ./election list_votes
    ./election results
    ./election reset

  All outputs are JSON printed to stdout.
  Data files (in same directory as binary):
    - candidates.csv   --> id,name
    - votes.csv        --> voterId,candidateId
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE 512
#define CAND_FILE "candidates.csv"
#define VOTE_FILE "votes.csv"

static void json_escape_print(const char *s) {
    // minimal JSON string escape (handles backslash and quote & control chars)
    putchar('"');
    for (const unsigned char *p = (const unsigned char *)s; *p; ++p) {
        unsigned char c = *p;
        if (c == '\\') printf("\\\\");
        else if (c == '"') printf("\\\"");
        else if (c == '\b') printf("\\b");
        else if (c == '\f') printf("\\f");
        else if (c == '\n') printf("\\n");
        else if (c == '\r') printf("\\r");
        else if (c == '\t') printf("\\t");
        else if (c < 32) printf("\\u%04x", c);
        else putchar(c);
    }
    putchar('"');
}

static int file_exists(const char *path) {
    FILE *f = fopen(path, "r");
    if (!f) return 0;
    fclose(f);
    return 1;
}

/* Read candidates into arrays. Returns count. Caller must free allocated name pointers */
static int read_candidates(int **ids_out, char ***names_out) {
    FILE *f = fopen(CAND_FILE, "r");
    if (!f) {
        *ids_out = NULL;
        *names_out = NULL;
        return 0;
    }
    int capacity = 16;
    int count = 0;
    int *ids = malloc(sizeof(int) * capacity);
    char **names = malloc(sizeof(char*) * capacity);
    char line[MAX_LINE];
    while (fgets(line, sizeof(line), f)) {
        // trim newline
        char *nl = strchr(line, '\n'); if (nl) *nl = '\0';
        // parse id,name
        char *comma = strchr(line, ',');
        if (!comma) continue;
        *comma = '\0';
        int id = atoi(line);
        char *name = comma + 1;
        if (count >= capacity) {
            capacity *= 2;
            ids = realloc(ids, sizeof(int) * capacity);
            names = realloc(names, sizeof(char*) * capacity);
        }
        ids[count] = id;
        names[count] = strdup(name);
        count++;
    }
    fclose(f);
    *ids_out = ids;
    *names_out = names;
    return count;
}

/* Count votes per candidate by scanning votes.csv. returns array of counts the same length as ids */
static int *count_votes(int *ids, int idcount) {
    int *counts = calloc(idcount, sizeof(int));
    FILE *f = fopen(VOTE_FILE, "r");
    if (!f) return counts;
    char line[MAX_LINE];
    while (fgets(line, sizeof(line), f)) {
        char *comma = strchr(line, ',');
        if (!comma) continue;
        // voter is before comma, candID after
        int cand = atoi(comma + 1);
        for (int i = 0; i < idcount; ++i) {
            if (ids[i] == cand) { counts[i]++; break; }
        }
    }
    fclose(f);
    return counts;
}

static int candidate_exists(int id) {
    int *ids; char **names;
    int n = read_candidates(&ids, &names);
    int found = 0;
    for (int i = 0; i < n; ++i) {
        if (ids[i] == id) { found = 1; break; }
    }
    // free
    for (int i = 0; i < n; ++i) free(names[i]);
    free(names); free(ids);
    return found;
}

static int voter_already_voted(int voterId) {
    FILE *f = fopen(VOTE_FILE, "r");
    if (!f) return 0;
    char line[MAX_LINE];
    while (fgets(line, sizeof(line), f)) {
        char *comma = strchr(line, ',');
        if (!comma) continue;
        *comma = '\0';
        int v = atoi(line);
        if (v == voterId) { fclose(f); return 1; }
    }
    fclose(f);
    return 0;
}

static void cmd_add(int id, const char *name) {
    if (candidate_exists(id)) {
        printf("{\"ok\":false,\"msg\":\"exists\"}");
        return;
    }
    FILE *f = fopen(CAND_FILE, "a");
    if (!f) {
        printf("{\"ok\":false,\"msg\":\"io_error\"}");
        return;
    }
    // Replace any newline or comma in name
    char clean[256]; int j=0;
    for (const char *p=name; *p && j < (int)sizeof(clean)-1; ++p) {
        if (*p == ',') clean[j++] = ' '; // avoid breaking CSV
        else if (*p == '\n' || *p == '\r') break;
        else clean[j++] = *p;
    }
    clean[j] = '\0';
    fprintf(f, "%d,%s\n", id, clean);
    fclose(f);
    printf("{\"ok\":true,\"msg\":\"candidate_added\"}");
}

static void cmd_vote(int voterId, int candidateId) {
    if (!candidate_exists(candidateId)) {
        printf("{\"ok\":false,\"msg\":\"candidate_not_found\"}");
        return;
    }
    if (voter_already_voted(voterId)) {
        printf("{\"ok\":false,\"msg\":\"duplicate_voter\"}");
        return;
    }
    FILE *f = fopen(VOTE_FILE, "a");
    if (!f) {
        printf("{\"ok\":false,\"msg\":\"io_error\"}");
        return;
    }
    fprintf(f, "%d,%d\n", voterId, candidateId);
    fclose(f);
    printf("{\"ok\":true,\"msg\":\"vote_recorded\"}");
}

static void cmd_list_candidates() {
    int *ids; char **names;
    int n = read_candidates(&ids, &names);
    int *counts = count_votes(ids, n);
    printf("{\"candidates\":[");
    for (int i = 0; i < n; ++i) {
        if (i) printf(",");
        printf("{\"id\":%d,\"name\":", ids[i]);
        json_escape_print(names[i]);
        printf(",\"votes\":%d}", counts[i]);
    }
    printf("]}");
    for (int i = 0; i < n; ++i) free(names[i]);
    free(names); free(ids); free(counts);
}

static void cmd_list_votes() {
    FILE *f = fopen(VOTE_FILE, "r");
    printf("{\"votes\":[");
    if (!f) { printf("]}"); return; }
    char line[MAX_LINE];
    int first = 1;
    while (fgets(line, sizeof(line), f)) {
        char *comma = strchr(line, ',');
        if (!comma) continue;
        *comma = '\0';
        int voter = atoi(line);
        int cand = atoi(comma + 1);
        if (!first) printf(",");
        printf("{\"voter\":%d,\"candidate\":%d}", voter, cand);
        first = 0;
    }
    printf("]}");
    fclose(f);
}

static void cmd_results() {
    int *ids; char **names;
    int n = read_candidates(&ids, &names);
    int *counts = count_votes(ids, n);

    // find winner (max votes; first with max)
    int winnerIndex = -1;
    for (int i = 0; i < n; ++i) {
        if (winnerIndex == -1 || counts[i] > counts[winnerIndex]) winnerIndex = i;
    }

    printf("{\"candidates\":[");
    for (int i = 0; i < n; ++i) {
        if (i) printf(",");
        printf("{\"id\":%d,\"name\":", ids[i]);
        json_escape_print(names[i]);
        printf(",\"votes\":%d}", counts[i]);
    }
    printf("],\"winner\":");
    if (winnerIndex >= 0) {
        printf("{\"id\":%d,\"name\":", ids[winnerIndex]);
        json_escape_print(names[winnerIndex]);
        printf(",\"votes\":%d}", counts[winnerIndex]);
    } else {
        printf("null");
    }
    printf("}");
    for (int i = 0; i < n; ++i) free(names[i]);
    free(names); free(ids); free(counts);
}

static void cmd_reset() {
    // remove both files
    remove(CAND_FILE);
    remove(VOTE_FILE);
    printf("{\"ok\":true}");
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("{\"ok\":false,\"msg\":\"usage\"}");
        return 0;
    }
    const char *cmd = argv[1];
    if (strcmp(cmd, "add") == 0 && argc >= 4) {
        int id = atoi(argv[2]);
        // join argv[3..] as name
        char namebuf[256] = "";
        for (int i = 3; i < argc; ++i) {
            strcat(namebuf, argv[i]);
            if (i+1 < argc) strcat(namebuf, " ");
        }
        cmd_add(id, namebuf);
    } else if (strcmp(cmd, "vote") == 0 && argc == 4) {
        int voter = atoi(argv[2]);
        int cand = atoi(argv[3]);
        cmd_vote(voter, cand);
    } else if (strcmp(cmd, "list_candidates") == 0) {
        cmd_list_candidates();
    } else if (strcmp(cmd, "list_votes") == 0) {
        cmd_list_votes();
    } else if (strcmp(cmd, "results") == 0) {
        cmd_results();
    } else if (strcmp(cmd, "reset") == 0) {
        cmd_reset();
    } else {
        printf("{\"ok\":false,\"msg\":\"invalid_command\"}");
    }
    return 0;
}
