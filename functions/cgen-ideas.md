# Coach Generation Ideas

## RAG Platonic Coach Actions (uses vector search)

1. **Shared Interests Discovery**
   - Embed hobby/interest keywords
   - Search conversation for topics discussed by both friends
   - Identify common interests they haven't explored together yet
   - "I noticed you both mentioned [X], have you considered doing [Y] together?"

2. **Conversation Pattern Analysis**
   - Embed different conversation styles (supportive, advice-giving, venting, celebrating)
   - Search for dominant patterns in their friendship
   - Suggest balance improvements
   - "Your friendship shows strong support during tough times, but less celebration of wins"

3. **Topic Evolution Tracker**
   - Embed conversation topics over time periods
   - Track how their discussions have evolved
   - Identify topics that disappeared or emerged
   - "You used to talk about [X] frequently but haven't in months. Any updates?"

4. **Friendship Milestone Recognition**
   - Embed phrases indicating shared experiences/milestones
   - Search for significant moments in their friendship
   - Create a friendship timeline
   - "Remember when you both [milestone]? That was a turning point in your friendship"

5. **Communication Gap Finder**
   - Embed question patterns and response patterns
   - Find unanswered questions or dropped topics
   - Highlight communication misses
   - "I noticed [Friend] asked about [X] but never got a response"

## RAG Group Coach Actions (uses vector search)

1. **Group Dynamics Analyzer**
   - Embed participation patterns for each member
   - Search for who talks to whom most
   - Visualize group interaction network
   - "The group dynamics show [Member A] and [B] interact most, while [C] is less engaged"

2. **Topic Champion Identifier**
   - Embed topics with speaker identification
   - Find who brings up which topics most
   - Identify each member's interests/expertise
   - "[Member] is your group's go-to for [topic]. They've brought it up X times"

3. **Group Memory Lane**
   - Embed memorable quotes and moments
   - Search for the most referenced shared experiences
   - Create a "greatest hits" of group memories
   - "Your group's most referenced memory is [event]. It's been mentioned X times"

4. **Inclusion Monitor**
   - Embed interaction patterns focusing on responses
   - Search for members who get fewer responses
   - Identify inclusion gaps
   - "[Member] contributes regularly but receives 40% fewer responses than average"

5. **Group Goal Alignment**
   - Embed goal-related keywords and plans
   - Search for common objectives or conflicts
   - Track progress on group goals
   - "The group mentioned [goal] 15 times but hasn't discussed concrete steps"

## Regular Platonic Coach Actions (no vector search)

1. **Friendship Check-in Generator**
   - Analyzes message frequency and length trends
   - Generates custom check-in questions based on communication patterns
   - "Your messages have gotten shorter lately. Everything okay between you two?"

2. **Conflict Resolution Helper**
   - Identifies tension indicators (short responses, delayed replies, formal language)
   - Provides specific conflict resolution strategies
   - "I'm sensing some tension. Here's how to address it constructively..."

3. **Friendship Strengths Mirror**
   - Analyzes positive interaction patterns
   - Reflects back what makes their friendship work
   - "Your friendship excels at [specific strength]. Here's how to build on it"

4. **Balance Meter**
   - Tracks give-and-take ratios in conversations
   - Identifies if one person dominates or supports more
   - "The support balance is 70/30. Here's how to even it out"

5. **Activity Suggester**
   - Based on conversation topics and interests
   - Suggests specific activities to do together
   - "Based on your recent conversations, you might enjoy [specific activity]"

## Regular Group Coach Actions (no vector search)

1. **Meeting Effectiveness Scorer**
   - Analyzes group chat patterns during scheduled discussions
   - Scores effectiveness and suggests improvements
   - "Your last group discussion scored 6/10 for effectiveness. Here's why..."

2. **Role Optimizer**
   - Identifies natural roles members play (organizer, mood-lifter, devil's advocate)
   - Suggests how to leverage these roles better
   - "[Member A] is your natural organizer. Consider formalizing this role"

3. **Group Energy Tracker**
   - Monitors message frequency, emoji usage, response times
   - Identifies when group energy is low
   - "Group energy is at 40%. Time for a morale boost activity"

4. **Decision Making Analyzer**
   - Tracks how the group makes decisions
   - Identifies patterns and inefficiencies
   - "Your group takes an average of 47 messages to make simple decisions"

5. **Celebration Reminder**
   - Tracks mentioned achievements and milestones
   - Reminds group to celebrate member wins
   - "[Member] mentioned [achievement] but it wasn't celebrated. Time to recognize it!"

---

## Selected Best Ideas for Implementation

After careful consideration based on utility, ease of implementation, and overall quality:

1. **RAG Platonic**: **Shared Interests Discovery** - High utility for strengthening friendships, relatively straightforward vector search implementation
2. **RAG Group**: **Topic Champion Identifier** - Very useful for understanding group dynamics, clear implementation path
3. **Regular Platonic**: **Friendship Check-in Generator** - Practical and immediately useful, simple pattern analysis
4. **Regular Group**: **Group Energy Tracker** - Easy to implement, provides clear actionable insights